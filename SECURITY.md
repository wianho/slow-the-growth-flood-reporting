# Security Hardening Documentation

This document describes the security hardening measures implemented on the production server hosting the Slow the Growth Flood Reporting application.

**Last Updated:** October 21, 2025
**Server:** Ubuntu 24.04.3 LTS (Noble Numbat)
**Environment:** Production (Hetzner Cloud)

## Table of Contents

- [Overview](#overview)
- [Implemented Security Measures](#implemented-security-measures)
- [Configuration Files](#configuration-files)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Security Checklist](#security-checklist)

---

## Overview

The production server has been hardened with multiple layers of security controls to protect against common attack vectors while maintaining application availability. All changes were implemented conservatively to avoid disrupting the running flood monitoring application.

### Security Goals

- Prevent unauthorized access
- Detect and block malicious activity
- Monitor security events
- Maintain system integrity
- Ensure high availability

---

## Implemented Security Measures

### 1. Kernel Security Hardening

**File:** `/etc/sysctl.d/99-security-hardening.conf`

Network and kernel security parameters have been hardened to protect against various attack vectors:

#### Network Security
- **SYN Flood Protection**: `tcp_syncookies` enabled with optimized backlog settings
- **IP Spoofing Prevention**: Reverse path filtering enabled on all interfaces
- **ICMP Redirect Protection**: Disabled to prevent MITM attacks
- **Source Routing**: Disabled for both IPv4 and IPv6
- **Martian Packet Logging**: Enabled for detecting suspicious traffic

#### Kernel Protections
- **ASLR**: Address Space Layout Randomization enabled (`randomize_va_space = 2`)
- **Kernel Pointer Hiding**: Restricted access to kernel memory addresses
- **Kernel Log Protection**: Limited to privileged users only
- **Performance Event Paranoia**: Restricted kernel profiling to root

#### Key Parameters
```
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
kernel.perf_event_paranoid = 3
```

**Apply Changes:**
```bash
sudo sysctl -p /etc/sysctl.d/99-security-hardening.conf
```

---

### 2. SSH Hardening

**File:** `/etc/ssh/sshd_config.d/99-hardening.conf`

SSH has been configured with security best practices while maintaining access:

#### Authentication
- **Root Login**: Prohibit password authentication (keys only)
- **Password Authentication**: Currently enabled for safety (can be disabled after key setup)
- **Empty Passwords**: Disabled
- **Max Auth Tries**: Reduced to 3 attempts
- **Login Grace Time**: Reduced to 30 seconds

#### Cryptographic Settings
- **Strong Ciphers Only**: `chacha20-poly1305`, AES-GCM, AES-CTR
- **Strong MACs**: HMAC-SHA2-512/256 with ETM
- **Strong Key Exchange**: Curve25519, DH group 16/18
- **Modern Host Key Algorithms**: Ed25519, RSA-SHA2

#### Additional Hardening
- **X11 Forwarding**: Disabled (not needed on server)
- **TCP Forwarding**: Available but can be disabled if not needed
- **Tunneling**: Disabled
- **Strict Modes**: Enabled
- **Verbose Logging**: Enabled for security auditing

**To Disable Password Authentication (after confirming SSH keys work):**
```bash
# Edit /etc/ssh/sshd_config.d/99-hardening.conf
# Change: PasswordAuthentication yes
# To: PasswordAuthentication no
sudo systemctl restart ssh
```

---

### 3. Intrusion Prevention (fail2ban)

**Configuration Files:**
- `/etc/fail2ban/jail.d/custom-hardening.conf`
- `/etc/fail2ban/filter.d/nginx-docker-exploit.conf`
- `/etc/fail2ban/filter.d/nginx-docker-badbots.conf`

fail2ban actively monitors logs and blocks malicious IP addresses:

#### Active Jails

**1. SSH Protection (`sshd`)**
- Max Retries: 3 failed attempts
- Ban Time: 2 hours (7200 seconds)
- Find Time: 10 minutes
- **Status**: Already blocked 6,293+ IPs with 42,132+ failed attempts

**2. Nginx Exploit Detection (`nginx-docker-exploit`)**
- Monitors Docker container logs for exploit attempts
- Detects: `.git`, `.env`, `phpMyAdmin`, `cgi-bin`, SQL injection, shell attempts
- Max Retries: 3 attempts
- Ban Time: 2 hours

**3. Bad Bot Protection (`nginx-docker-badbots`)**
- Blocks scanning tools: `nmap`, `masscan`, `sqlmap`, `nikto`, etc.
- Max Retries: 2 attempts
- Ban Time: 24 hours (86400 seconds)

#### Monitoring Commands
```bash
# Check fail2ban status
sudo fail2ban-client status

# Check specific jail
sudo fail2ban-client status sshd
sudo fail2ban-client status nginx-docker-exploit

# View banned IPs
sudo fail2ban-client status nginx-docker-badbots

# Unban an IP (if needed)
sudo fail2ban-client set sshd unbanip <IP_ADDRESS>
```

---

### 4. Security Audit Logging (auditd)

**File:** `/etc/audit/rules.d/hardening.rules`

The audit daemon monitors and logs security-relevant events with 39 active rules:

#### Monitored Events

**Authentication & Authorization**
- Authentication attempts (`/var/log/auth.log`, `/var/log/faillog`)
- User/group database changes (`/etc/passwd`, `/etc/shadow`, `/etc/group`)
- Sudoers configuration changes
- Privilege escalation attempts

**System Configuration**
- SSH configuration changes
- Network configuration changes
- Hostname changes
- Firewall (UFW) configuration changes

**Security Tools**
- fail2ban configuration changes
- Audit configuration changes
- Docker configuration and socket access

**System Operations**
- Kernel module loading/unloading
- Cron job modifications
- Systemd service changes
- Process execution monitoring

#### Viewing Audit Logs
```bash
# Search for authentication events
sudo ausearch -k auth_log

# Search for password file changes
sudo ausearch -k passwd_changes

# Search for privilege escalation
sudo ausearch -k privilege_escalation

# View recent audit events
sudo ausearch -ts recent

# Generate audit report
sudo aureport --summary
```

---

### 5. Automatic Updates

**Files:**
- `/etc/apt/apt.conf.d/50unattended-upgrades`
- `/etc/apt/apt.conf.d/20auto-upgrades`

Automatic security updates are configured to keep the system patched:

#### Configuration
- **Security Updates**: Automatically installed
- **Auto-Reboot**: Disabled (manual reboot required)
- **Auto-Cleanup**: Enabled
  - Old kernels automatically removed
  - Unused dependencies cleaned up
  - Saves disk space

#### Checking for Updates
```bash
# Check for pending updates
sudo apt list --upgradable

# Check if reboot is required
ls -la /var/run/reboot-required

# View unattended-upgrades log
sudo tail -f /var/log/unattended-upgrades/unattended-upgrades.log
```

---

### 6. Firewall (UFW)

**Status:** Active

Currently configured ports:
- **22/tcp**: SSH (restricted by fail2ban)
- **80/tcp**: HTTP (redirects to HTTPS)
- **443/tcp**: HTTPS (application traffic)

**Default Policy:**
- Incoming: Deny
- Outgoing: Allow
- Routed: Deny

```bash
# Check firewall status
sudo ufw status verbose

# View firewall rules
sudo ufw status numbered
```

---

## Configuration Files

### System-Level Security Files

All security configurations are stored in system directories and persist across reboots:

```
/etc/sysctl.d/99-security-hardening.conf          # Kernel security parameters
/etc/ssh/sshd_config.d/99-hardening.conf          # SSH hardening
/etc/fail2ban/jail.d/custom-hardening.conf        # fail2ban jail configuration
/etc/fail2ban/filter.d/nginx-docker-exploit.conf  # Exploit detection filter
/etc/fail2ban/filter.d/nginx-docker-badbots.conf  # Bad bot filter
/etc/audit/rules.d/hardening.rules                # Audit rules
/etc/apt/apt.conf.d/50unattended-upgrades         # Auto-update settings
```

### Backing Up Security Configurations

```bash
# Create backup directory
sudo mkdir -p /root/backups/security-config

# Backup all security configs
sudo tar -czf /root/backups/security-config/security-$(date +%Y%m%d).tar.gz \
  /etc/sysctl.d/99-security-hardening.conf \
  /etc/ssh/sshd_config.d/99-hardening.conf \
  /etc/fail2ban/jail.d/ \
  /etc/fail2ban/filter.d/ \
  /etc/audit/rules.d/ \
  /etc/apt/apt.conf.d/50unattended-upgrades
```

---

## Monitoring and Maintenance

### Daily Checks

```bash
# 1. Check fail2ban status
sudo fail2ban-client status

# 2. Check for security updates
sudo apt list --upgradable 2>/dev/null | grep -i security

# 3. Check if reboot is needed
cat /var/run/reboot-required 2>/dev/null || echo "No reboot required"

# 4. Check audit log for suspicious activity
sudo ausearch -ts today -k auth_log | grep -i fail
```

### Weekly Reviews

```bash
# 1. Review banned IPs
sudo fail2ban-client status | grep "Jail list"

# 2. Generate audit report
sudo aureport --auth --summary

# 3. Check disk space (audit logs can grow)
df -h /var/log/audit

# 4. Review authentication logs
sudo journalctl -u ssh.service --since "1 week ago" | grep -i "failed\|error"
```

### Log Locations

- **SSH Logs**: `journalctl -u ssh.service`
- **fail2ban Logs**: `/var/log/fail2ban.log`
- **Audit Logs**: `/var/log/audit/audit.log`
- **Unattended Upgrades**: `/var/log/unattended-upgrades/`
- **Docker Logs**: `docker logs <container_name>`

---

## Security Checklist

### Initial Setup ✅
- [x] Kernel security parameters applied
- [x] SSH hardening configured
- [x] fail2ban installed and configured
- [x] Audit logging enabled
- [x] Automatic security updates enabled
- [x] Firewall (UFW) active and configured
- [x] Old kernel auto-cleanup enabled

### Recommended Next Steps
- [ ] Disable SSH password authentication (after confirming key access)
- [ ] Configure email notifications for fail2ban
- [ ] Set up log rotation for audit logs
- [ ] Schedule regular security update reviews
- [ ] **Reboot server to activate new kernel (6.8.0-85)**

### Regular Maintenance
- [ ] Weekly: Review fail2ban banned IPs
- [ ] Weekly: Check for security updates
- [ ] Monthly: Review audit logs for anomalies
- [ ] Monthly: Verify backup integrity
- [ ] Quarterly: Security configuration review

---

## Emergency Procedures

### Locked Out of SSH

If you get locked out due to fail2ban or configuration issues:

1. Access via cloud provider console (Hetzner Cloud Console)
2. Check fail2ban status: `sudo fail2ban-client status sshd`
3. Unban your IP: `sudo fail2ban-client set sshd unbanip YOUR_IP`
4. Or temporarily disable fail2ban: `sudo systemctl stop fail2ban`

### Reverting SSH Configuration

```bash
# Remove hardening config
sudo rm /etc/ssh/sshd_config.d/99-hardening.conf

# Restart SSH
sudo systemctl restart ssh
```

### Disabling Audit Rules

```bash
# Temporarily disable all audit rules
sudo auditctl -D

# Permanently disable (then reboot)
sudo systemctl disable auditd
```

---

## Additional Resources

- [Ubuntu Security Guide](https://ubuntu.com/security)
- [fail2ban Documentation](https://www.fail2ban.org/wiki/index.php/Main_Page)
- [Linux Audit Documentation](https://github.com/linux-audit/audit-documentation)
- [SSH Hardening Guide](https://www.ssh.com/academy/ssh/sshd_config)

---

## Change Log

### 2025-10-21 - Initial Security Hardening
- Implemented kernel security hardening (sysctl)
- Configured SSH hardening with strong cryptography
- Enhanced fail2ban with nginx Docker monitoring
- Installed and configured auditd with 39 security rules
- Enabled automatic cleanup of old kernels and dependencies
- Updated all system packages to latest security patches

---

**Note:** This is a living document. Update this file whenever security configurations are modified.
