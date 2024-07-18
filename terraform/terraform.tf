terraform {
  #   backend "s3" {
  #     bucket         = "demo-builder-state"
  #     key            = "terraform.tfstate"
  #     dynamodb_table = "demo-builder-state"
  #     region         = "us-east-2"
  #   }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_s3_bucket" "this" {
  bucket = "demo-builder-app-state"

  tags = {
    Name        = "state"
    Application = "demo-builder-app"
    Maintainer  = var.owner
    CreatedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "this" {
  name         = "demo-builder-app-state"
  hash_key     = "LockID"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "state"
    Application = "demo-builder-app"
    Maintainer  = var.owner
    CreatedBy   = "terraform"
  }
}
