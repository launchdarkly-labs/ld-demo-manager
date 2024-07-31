resource "aws_instance" "builder-server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.micro"
  key_name                    = var.key_pair
  iam_instance_profile        = aws_iam_instance_profile.builder-main-profile.id
  vpc_security_group_ids      = [aws_security_group.builder-server-sg.id]
  subnet_id                   = aws_subnet.public-subnet[0].id
  associate_public_ip_address = true
  user_data = templatefile("${path.module}/scripts/install.sh", {
    AWS_REGION        = var.aws_region
    LD_API_KEY        = var.ld_api_key
    GOOGLE_CREDS      = var.google_credentials
    FLASK_SESSION_KEY = var.flask_session_key
  })

  tags = {
    Name  = "${var.unique_identifier}-server"
    owner = var.owner
  }
}

resource "aws_security_group" "builder-server-sg" {
  name        = "${var.unique_identifier}-server-sg"
  description = "Builder server security group"
  vpc_id      = aws_vpc.primary-vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
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

data "aws_iam_policy_document" "builder-assume-role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "builder-main-access-doc" {
  statement {
    sid       = "FullAccess"
    effect    = "Allow"
    resources = ["*"]

    actions = [
      "ec2:DescribeInstances",
      "ec2:DescribeTags",
      "ec2messages:GetMessages",
      "ssm:UpdateInstanceInformation",
      "ssm:ListInstanceAssociations",
      "ssm:ListAssociations",
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:BatchGetImage",
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:DescribeKey",
      "s3:*",
      "dynamodb:*"
    ]
  }
}

resource "aws_iam_role" "builder-main-access-role" {
  name               = "${var.unique_identifier}-access-role"
  assume_role_policy = data.aws_iam_policy_document.builder-assume-role.json

  tags = {
    owner = var.owner
  }
}

resource "aws_iam_role_policy" "builder-main-access-policy" {
  name   = "${var.unique_identifier}-access-policy"
  role   = aws_iam_role.builder-main-access-role.id
  policy = data.aws_iam_policy_document.builder-main-access-doc.json
}

resource "aws_iam_instance_profile" "builder-main-profile" {
  name = "${var.unique_identifier}-access-profile"
  role = aws_iam_role.builder-main-access-role.name
}
