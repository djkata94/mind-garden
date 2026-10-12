"use client";

// Generic error boundary: 3D must never white-screen (spec section 6).
// Used around the Canvas (fallback: banner + link to /notes) and around
// Environment (fallback: null, garden still renders with lights only).
import { Component } from "react";

export default class GardenErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
