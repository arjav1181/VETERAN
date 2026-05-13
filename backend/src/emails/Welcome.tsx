import React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Section, Hr } from "@react-email/components";

interface WelcomeEmailProps {
  username: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({ username, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to VETERAN, {username}!</Preview>
      <Body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", padding: "20px" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#161b22", borderRadius: "6px", padding: "32px", border: "1px solid #30363d" }}>
          <Heading style={{ color: "#58a6ff", fontSize: "24px", margin: "0 0 16px" }}>
            Welcome to VETERAN!
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
            Hi {username}, we're excited to have you on board.
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.5", color: "#8b949e", margin: "0 0 24px" }}>
            VETERAN is a Git platform where you can host and review code, manage projects, and build software together with millions of developers.
          </Text>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Link href={dashboardUrl} style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "#238636", color: "#ffffff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" }}>
              Get Started
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
