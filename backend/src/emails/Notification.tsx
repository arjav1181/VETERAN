import React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Section, Hr } from "@react-email/components";

interface NotificationEmailProps {
  title: string;
  body: string;
  link: string;
  notificationType: string;
}

export default function NotificationEmail({ title, body, link, notificationType }: NotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#161b22", borderRadius: "6px", padding: "32px", border: "1px solid #30363d" }}>
          <Text style={{ fontSize: "12px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>
            {notificationType}
          </Text>
          <Heading style={{ color: "#c9d1d9", fontSize: "20px", margin: "0 0 16px" }}>
            {title}
          </Heading>
          <Text style={{ fontSize: "14px", lineHeight: "1.5", color: "#8b949e", margin: "0 0 24px" }}>
            {body}
          </Text>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Link href={link} style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "#238636", color: "#ffffff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" }}>
              View on VETERAN
            </Link>
          </Section>
          <Hr style={{ border: "1px solid #30363d", margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#8b949e", margin: "0" }}>
            You received this notification because you are subscribed to {notificationType} notifications.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
