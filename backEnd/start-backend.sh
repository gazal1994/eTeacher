#!/bin/bash

# Quick Start Script for Backend (Linux/Mac)
# Run this script from the backEnd folder

echo "========================================"
echo "  Mini LMS Backend - Quick Start"
echo "========================================"
echo ""

# Check if .NET SDK is installed
echo "Checking for .NET SDK..."
if ! command -v dotnet &> /dev/null; then
    echo "ERROR: .NET SDK is not installed!"
    echo "Please install .NET 8 SDK from: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi
DOTNET_VERSION=$(dotnet --version)
echo "✓ .NET SDK version $DOTNET_VERSION found"
echo ""

# Restore dependencies
echo "Restoring dependencies..."
dotnet restore
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to restore dependencies"
    exit 1
fi
echo "✓ Dependencies restored"
echo ""

# Build the project
echo "Building the project..."
dotnet build --no-restore
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi
echo "✓ Build successful"
echo ""

# Run tests
echo "Running unit tests..."
dotnet test --no-build --verbosity quiet
if [ $? -ne 0 ]; then
    echo "WARNING: Some tests failed"
else
    echo "✓ All tests passed"
fi
echo ""

# Start the API
echo "========================================"
echo "Starting the API server..."
echo "========================================"
echo ""
echo "API will be available at:"
echo "  • HTTP:       http://localhost:5000"
echo "  • HTTPS:      https://localhost:5001"
echo "  • Swagger UI: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd MiniLmsApi
dotnet run --no-build
