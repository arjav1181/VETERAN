import React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Section, Hr } from "@react-email/components";

interface SecurityAlertEmailProps {
  alertType: string;
  description: string;
  actionUrl: string;
  username: string;
}

export default function SecurityAlertEmail({ alertType, description, actionUrl, username }: SecurityAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Security Alert: {alertType}</Preview>
      <Body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#161b22", borderRadius: "6px", padding: "32px", border: "1px solid #30363d" }}>
          <Heading style={{ color: "#f85149", fontSize: "24px", margin: "0 0 16px" }}>
            Security Alert
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
            Hi {username},
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: "14px", margin: "0 0 8px", color: "#c9d1d9" }}>
            {alertType}
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.5", color: "#8b949e", margin: "0 0 24px" }}>
            {description}
          </Text>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Link href={actionUrl} style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "#f85149", color: "#ffffff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" }}>
              Review Security Settings
            </Link>
          </Section>
          <Text style={{ fontSize: "12px", color: "#8b949e", margin: "0 0 8px" }}>
            If you did not perform this action, please secure your account immediately.
          </Text>
          <Hr style={{ border: "1px solid #30363d", margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#8b949e", margin: "0" }}>
            This is an automated security alert from VETERAN.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
