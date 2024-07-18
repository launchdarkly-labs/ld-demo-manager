resource "aws_lb" "builder-lb" {
  name               = "demo-builder-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.builder-lb-sg.id]
  subnets            = [for subnet in aws_subnet.public-subnet : subnet.id]

  enable_deletion_protection = false
}

resource "aws_lb_target_group" "builder-tg" {
  name     = "demo-builder-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.primary-vpc.id

  target_health_state {
    enable_unhealthy_connection_termination = false
  }
}

resource "aws_lb_target_group_attachment" "builder-tg-add-1" {
  target_group_arn = aws_lb_target_group.builder-tg.arn
  target_id        = aws_instance.builder-server.id
  port             = 80
}

resource "aws_lb_listener" "builder-lb-listener" {
  load_balancer_arn = aws_lb.builder-lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:us-east-2:955116512041:certificate/8b004abc-a1ca-4d2f-be99-8ca1d38b34d9"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.builder-tg.arn
  }
}

resource "aws_security_group" "builder-lb-sg" {
  name        = "${var.unique_identifier}-lb-sg"
  description = "Builder LB security group"
  vpc_id      = aws_vpc.primary-vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    owner = var.owner
  }
}
