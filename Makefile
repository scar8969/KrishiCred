.PHONY: help start stop restart dev status logs clean

PROJECT_ROOT := $(shell pwd)
BACKEND_DIR := $(PROJECT_ROOT)/krishicred_backend
FRONTEND_DIR := $(PROJECT_ROOT)/website

help:
	@echo "Krishicred Project Management"
	@echo ""
	@echo "Available targets:"
	@echo "  make start      - Start all services (backend + frontend)"
	@echo "  make stop      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make dev       - Start in development mode with live reload"
	@echo "  make status    - Show status of all services"
	@echo "  make logs      - Show logs from all services"
	@echo "  make clean     - Kill any lingering processes"

start dev:
	@echo "Starting Krishicred services..."
	@echo ""
	@echo "Starting backend on port 8000..."
	@cd $(BACKEND_DIR) && nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
	@echo "$$!" > .backend_pid
	@echo "Backend started (PID: $$(cat .backend_pid))"
	@sleep 2
	@echo ""
	@echo "Starting frontend on port 5173..."
	@cd $(FRONTEND_DIR) && nohup npm run dev > frontend.log 2>&1 &
	@echo "$$!" > .frontend_pid
	@echo "Frontend started (PID: $$(cat .frontend_pid))"
	@sleep 3
	@echo ""
	@echo "All services started!"
	@echo "  Backend: http://localhost:8000"
	@echo "  Frontend: http://localhost:5173"
	@echo ""
	@echo "Logs: backend.log, frontend.log"

stop:
	@echo "Stopping Krishicred services..."
	@if [ -f .backend_pid ]; then \
		kill $$(cat .backend_pid) 2>/dev/null || true; \
		rm .backend_pid; \
		echo "Backend stopped"; \
	fi
	@if [ -f .frontend_pid ]; then \
		kill $$(cat .frontend_pid) 2>/dev/null || true; \
		rm .frontend_pid; \
		echo "Frontend stopped"; \
	fi
	@echo "All services stopped"

restart: stop start

status:
	@echo "Service Status:"
	@echo ""
	@echo "Backend:"
	@if [ -f .backend_pid ] && kill -0 $$(cat .backend_pid) 2>/dev/null; then \
		echo "  Running (PID: $$(cat .backend_pid))"; \
	else \
		echo "  Not running"; \
	fi
	@echo ""
	@echo "Frontend:"
	@if [ -f .frontend_pid ] && kill -0 $$(cat .frontend_pid) 2>/dev/null; then \
		echo "  Running (PID: $$(cat .frontend_pid))"; \
	else \
		echo "  Not running"; \
	fi

logs:
	@echo "=== Backend Logs (last 20 lines) ==="
	@tail -20 backend.log 2>/dev/null || echo "No backend logs"
	@echo ""
	@echo "=== Frontend Logs (last 20 lines) ==="
	@tail -20 frontend.log 2>/dev/null || echo "No frontend logs"

clean:
	@echo "Cleaning up..."
	@pkill -f "uvicorn app.main:app" 2>/dev/null || true
	@pkill -f "npm run dev" 2>/dev/null || true
	@rm -f .backend_pid .frontend_pid backend.log frontend.log
	@echo "Cleanup complete"