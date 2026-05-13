import React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Section, Hr } from "@react-email/components";

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

export default function PasswordResetEmail({ username, resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your VETERAN password</Preview>
      <Body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#161b22", borderRadius: "6px", padding: "32px", border: "1px solid #30363d" }}>
          <Heading style={{ color: "#58a6ff", fontSize: "24px", margin: "0 0 16px" }}>
            Password Reset
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
            Hi {username},
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.5", color: "#8b949e", margin: "0 0 24px" }}>
            We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
          </Text>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Link href={resetUrl} style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "#238636", color: "#ffffff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" }}>
              Reset Password
            </Link>
          </Section>
          <Text style={{ fontSize: "12px", color: "#8b949e", margin: "0 0 8px" }}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={{ fontSize: "12px", color: "#58a6ff", margin: "0", wordBreak: "break-all" }}>
            {resetUrl}
          </Text>
          <Hr style={{ border: "1px solid #30363d", margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#8b949e", margin: "0" }}>
            If you did not request a password reset, please ignore this email or contact support.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
