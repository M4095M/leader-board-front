import React from "react";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "10vh" }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <a href="/" style={{ color: "#007bff" }}>Go to Home</a>
    </div>
  );
}