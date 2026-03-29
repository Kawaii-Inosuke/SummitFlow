"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  border: {
    border: "3px solid #EC5B13",
    borderRadius: 8,
    padding: 40,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    fontSize: 10,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EC5B13",
    marginBottom: 10,
    textAlign: "center",
  },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 6,
  },
  description: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 400,
    lineHeight: 1.5,
    marginBottom: 30,
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid #E2E8F0",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 8,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerValue: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "bold",
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: "#EC5B13",
    borderRadius: 2,
    marginBottom: 20,
  },
});

interface CertificateProps {
  name: string;
  eventTitle: string;
  date: string;
}

export function CertificateDocument({ name, eventTitle, date }: CertificateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.header}>Certificate of Participation</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>This is proudly presented to</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>for successfully participating in</Text>
          <Text style={styles.eventName}>{eventTitle}</Text>
          <Text style={styles.description}>
            Organized by SummitFlow at SRM Institute of Science and Technology.
            This certificate acknowledges active participation and completion of the event.
          </Text>
          <View style={styles.footer}>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Date</Text>
              <Text style={styles.footerValue}>{date}</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Issued By</Text>
              <Text style={styles.footerValue}>SummitFlow</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Certificate ID</Text>
              <Text style={styles.footerValue}>SF-{Date.now().toString(36).toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
