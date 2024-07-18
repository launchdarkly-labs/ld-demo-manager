locals {
  aws_azs = [for az in var.aws_azs : "${var.aws_region}${az}"]
}
