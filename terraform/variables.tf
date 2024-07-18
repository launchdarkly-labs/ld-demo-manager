variable "aws_region" {
  description = "The AWS region this application will run in"
  default     = "us-east-2"
}

variable "aws_azs" {
  description = "The availability zones in the AWS region"
  type        = list(string)
  default     = ["a", "b", "c"]
}

variable "unique_identifier" {
  description = "A unique identifier for naming resources to avoid name collisions"
  validation {
    condition     = can(regex("^[a-z]{6,10}$", var.unique_identifier))
    error_message = "unique_identifier must be lower case letters only and 6 to 10 characters in length"
  }
}

variable "dns_hostname" {
  default = "demobuilder"
}

variable "key_pair" {
  description = "Valid EC2 key pair name"
}

variable "google_credentials" {
  description = "Google Cloud credentials file"
}

variable "flask_session_key" {
  description = "Flask session key"
}

variable "ld_api_key" {
  description = "LaunchDarkly API key"
}

variable "owner" {
  description = "Your email address"
}
