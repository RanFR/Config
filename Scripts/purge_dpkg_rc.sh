#!/bin/bash
dpkg -l | grep ^rc | awk '{print $2}' | xargs sudo apt purge -y
