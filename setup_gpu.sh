#!/bin/bash
# setup_gpu.sh - Enable NVIDIA GPU support for StoryForge Docker Stack
# Optimized for Ubuntu 24.04 LTS (Noble) - March 2026

echo "--- StoryForge: High-Fidelity GPU Setup ---"

# 1. Add the NVIDIA package repositories using the modern GPG keyring method
echo "[1/4] Configuring NVIDIA Container Toolkit repositories..."
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# 2. Install the toolkit
echo "[2/4] Updating package lists and installing toolkit..."
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# 3. Configure Docker to use the NVIDIA runtime (2026 Standard)
echo "[3/4] Configuring Docker to recognize NVIDIA GPU driver..."
sudo nvidia-ctk runtime configure --runtime=docker

# 4. Restart Docker to apply the hardware bridge
echo "[4/4] Restarting Docker daemon to finalize bridge..."
sudo systemctl restart docker

# 5. Verification
echo "--- Verification ---"
if docker run --help | grep -i "gpus" > /dev/null; then
    echo "✅ Docker now supports --gpus flag."
else
    echo "❌ Docker GPU support check failed. Please check logs."
fi

echo "--- Setup Complete! ---"
echo "You can now run ./deploy.sh to launch Gemma 3 (12B) on your local GPU."
