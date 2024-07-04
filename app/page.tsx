"use client";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "@/app/dashboard/[playlistId]/page";
import React from "react";

export default function Home() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<h1>Home</h1>} />
                <Route path="/dashboard/:playlistId" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}
