output "terminal-login" {
  value = "ssh -i ~/keys/${var.key_pair}.pem ubuntu@${aws_instance.builder-server.public_ip}"
}
