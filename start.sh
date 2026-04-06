#!/bin/bash

# KrishiCred Startup Script
# Starts both backend and frontend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/krishicred_backend"
FRONTEND_DIR="$PROJECT_ROOT/website"
PID_DIR="$PROJECT_ROOT/.pids"
LOG_DIR="$PROJECT_ROOT/logs"

# Create necessary directories
mkdir -p "$PID_DIR"
mkdir -p "$LOG_DIR"

# PID files
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"

# Ports
BACKEND_PORT=8888
FRONTEND_PORT=5173

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     KrishiCred Development Server       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# Function to kill existing processes
kill_existing() {
    local service=$1
    local pid_file=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping existing $service (PID: $pid)...${NC}"
            kill "$pid" 2>/dev/null || true
            sleep 1
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
        rm -f "$pid_file"
    fi
}

# Function to start backend
start_backend() {
    echo -e "${GREEN}[1/2] Starting Backend...${NC}"

    # Check if port is already in use
    if check_port $BACKEND_PORT; then
        echo -e "${YELLOW}Port $BACKEND_PORT already in use. Attempting to free it...${NC}"
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi

    # Kill any existing backend process
    kill_existing "Backend" "$BACKEND_PID_FILE"

    cd "$BACKEND_DIR"

    # Set environment for development
    export DATABASE_URL="sqlite+aiosqlite:///./krishicred.db"
    export ENVIRONMENT="development"
    export DEBUG="True"

    # Start backend
    nohup python -m uvicorn app.main:app \
        --host 0.0.0.0 \
        --port $BACKEND_PORT \
        --reload \
        > "$LOG_DIR/backend.log" 2>&1 &

    local pid=$!
    echo $pid > "$BACKEND_PID_FILE"

    # Wait for backend to start
    echo -e "${YELLOW}Waiting for backend to start...${NC}"
    for i in {1..30}; do
        if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend started successfully!${NC}"
            echo -e "  URL: ${BLUE}http://localhost:$BACKEND_PORT${NC}"
            echo -e "  Docs: ${BLUE}http://localhost:$BACKEND_PORT/docs${NC}"
            break
        fi
        sleep 0.5
    done

    if ! curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
        echo -e "${RED}✗ Backend failed to start. Check logs: $LOG_DIR/backend.log${NC}"
        return 1
    fi

    cd "$PROJECT_ROOT"
}

# Function to start frontend
start_frontend() {
    echo -e "${GREEN}[2/2] Starting Frontend...${NC}"

    # Kill any existing frontend process
    kill_existing "Frontend" "$FRONTEND_PID_FILE"

    cd "$FRONTEND_DIR"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi

    # Clear previous frontend log
    > "$LOG_DIR/frontend.log"

    # Start frontend
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    local pid=$!
    echo $pid > "$FRONTEND_PID_FILE"

    # Wait for frontend to start and detect actual port
    echo -e "${YELLOW}Waiting for frontend to start...${NC}"
    local actual_port=""
    for i in {1..30}; do
        # Check logs for the actual port (Vite outputs "Local: http://localhost:PORT/")
        actual_port=$(grep -oP "Local:\s*http://localhost:\K\d+" "$LOG_DIR/frontend.log" 2>/dev/null | head -1)
        if [ -n "$actual_port" ]; then
            break
        fi
        sleep 0.3
    done

    # If no port found in logs, try to detect from netstat
    if [ -z "$actual_port" ]; then
        # Get the PID's listening port
        local pid_port=$(lsof -ti -sTCP:LISTEN -a -p $pid 2>/dev/null | head -1)
        if [ -n "$pid_port" ]; then
            actual_port=$pid_port
        fi
    fi

    # Use detected port or fall back to default
    local display_port="${actual_port:-$FRONTEND_PORT}"

    echo -e "${GREEN}✓ Frontend started successfully!${NC}"
    echo -e "  URL: ${BLUE}http://localhost:$display_port${NC}"

    # Save actual port for status command
    echo "$display_port" > "$PID_DIR/frontend_port"

    cd "$PROJECT_ROOT"
}

# Function to stop all services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    kill_existing "Backend" "$BACKEND_PID_FILE"
    kill_existing "Frontend" "$FRONTEND_PID_FILE"
    echo -e "${GREEN}✓ All services stopped${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}=== Backend Logs (last 20 lines) ===${NC}"
    if [ -f "$LOG_DIR/backend.log" ]; then
        tail -20 "$LOG_DIR/backend.log"
    else
        echo -e "${YELLOW}No backend logs found${NC}"
    fi

    echo ""
    echo -e "${BLUE}=== Frontend Logs (last 20 lines) ===${NC}"
    if [ -f "$LOG_DIR/frontend.log" ]; then
        tail -20 "$LOG_DIR/frontend.log"
    else
        echo -e "${YELLOW}No frontend logs found${NC}"
    fi
}

# Function to show status
show_status() {
    echo -e "${BLUE}=== Service Status ===${NC}"
    echo ""

    # Backend status
    if [ -f "$BACKEND_PID_FILE" ]; then
        local pid=$(cat "$BACKEND_PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "Backend: ${GREEN}Running${NC} (PID: $pid)"
            if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
                echo -e "  Status: ${GREEN}Healthy ✓${NC}"
            else
                echo -e "  Status: ${RED}Unhealthy ✗${NC}"
            fi
        else
            echo -e "Backend: ${RED}Stopped${NC} (stale PID file)"
            rm -f "$BACKEND_PID_FILE"
        fi
    else
        echo -e "Backend: ${RED}Stopped${NC}"
    fi

    echo ""

    # Frontend status
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local pid=$(cat "$FRONTEND_PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            # Get actual port from saved file or logs
            local actual_port=$FRONTEND_PORT
            if [ -f "$PID_DIR/frontend_port" ]; then
                actual_port=$(cat "$PID_DIR/frontend_port")
            else
                # Try to get from logs
                actual_port=$(grep -oP "Local:\s*http://localhost:\K\d+" "$LOG_DIR/frontend.log" 2>/dev/null | head -1)
                actual_port=${actual_port:-$FRONTEND_PORT}
            fi
            echo -e "Frontend: ${GREEN}Running${NC} (PID: $pid)"
            echo -e "  URL: ${BLUE}http://localhost:$actual_port${NC}"
        else
            echo -e "Frontend: ${RED}Stopped${NC} (stale PID file)"
            rm -f "$FRONTEND_PID_FILE"
        fi
    else
        echo -e "Frontend: ${RED}Stopped${NC}"
    fi
}

# Main script logic
case "${1:-start}" in
    start)
        start_backend
        echo ""
        start_frontend
        echo ""
        echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║    All services started successfully!     ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
        echo ""

        # Get actual frontend port
        actual_frontend_port=$FRONTEND_PORT
        if [ -f "$PID_DIR/frontend_port" ]; then
            actual_frontend_port=$(cat "$PID_DIR/frontend_port")
        fi

        echo -e "Backend:  ${BLUE}http://localhost:$BACKEND_PORT${NC}"
        echo -e "Frontend: ${BLUE}http://localhost:$actual_frontend_port${NC}"
        echo -e "API Docs: ${BLUE}http://localhost:$BACKEND_PORT/docs${NC}"
        echo ""
        echo -e "Logs: ${YELLOW}tail -f $LOG_DIR/{backend,frontend}.log${NC}"
        echo -e "Stop: ${YELLOW}./start.sh stop${NC}"
        echo ""
        ;;

    stop)
        stop_services
        ;;

    restart)
        stop_services
        sleep 1
        $0 start
        ;;

    status)
        show_status
        ;;

    logs)
        show_logs
        ;;

    backend)
        start_backend
        ;;

    frontend)
        start_frontend
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|status|logs|backend|frontend}"
        echo ""
        echo "Commands:"
        echo "  start     - Start both backend and frontend (default)"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  status    - Show service status"
        echo "  logs      - Show recent logs"
        echo "  backend   - Start only backend"
        echo "  frontend  - Start only frontend"
        exit 1
        ;;
esac
