"use client"

import type React from "react"

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="mb-4">
          <i className="bi bi-chat-dots-fill text-primary" style={{ fontSize: "3rem" }}></i>
        </div>
        
        <h1 className="login-title">ChatGPT Clone</h1>
        <p className="login-subtitle">
          Sign in to start chatting and generating images with AI
        </p>
        
        <div className="mb-4">
          <div className="row g-3">
            <div className="col-6">
              <div className="text-center p-3 border rounded">
                <i className="bi bi-chat-text text-primary mb-2 d-block" style={{ fontSize: "1.5rem" }}></i>
                <small>Text Chat</small>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center p-3 border rounded">
                <i className="bi bi-image text-primary mb-2 d-block" style={{ fontSize: "1.5rem" }}></i>
                <small>Image Generation</small>
              </div>
            </div>
          </div>
        </div>
        
        <a href="/api/auth/login" className="btn login-btn w-100">
          <i className="bi bi-box-arrow-in-right me-2"></i>
          Sign In with Auth0
        </a>
        
        <div className="mt-4">
          <small className="text-muted">
            Secure authentication powered by Auth0
          </small>
        </div>
      </div>
    </div>
  )
}
