resource "aws_route53_record" "builder-record" {
  zone_id = data.aws_route53_zone.lddemozone.zone_id
  name    = var.dns_hostname
  type    = "CNAME"
  ttl     = "300"
  records = [aws_lb.builder-lb.dns_name]
}
