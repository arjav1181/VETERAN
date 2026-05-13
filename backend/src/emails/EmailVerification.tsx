import React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Section, Hr } from "@react-email/components";

interface EmailVerificationProps {
  username: string;
  verificationUrl: string;
}

export default function EmailVerification({ username, verificationUrl }: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#161b22", borderRadius: "6px", padding: "32px", border: "1px solid #30363d" }}>
          <Heading style={{ color: "#58a6ff", fontSize: "24px", margin: "0 0 16px" }}>
            Verify Your Email
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
            Hi {username},
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.5", color: "#8b949e", margin: "0 0 24px" }}>
            Please verify your email address to complete your registration. This link expires in 24 hours.
          </Text>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Link href={verificationUrl} style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "#238636", color: "#ffffff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" }}>
              Verify Email
            </Link>
          </Section>
          <Hr style={{ border: "1px solid #30363d", margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#8b949e", margin: "0" }}>
            If you did not create this account, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
