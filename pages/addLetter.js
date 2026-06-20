import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import LetterForm from "@/components/LetterForm";

export default function AddLetterUser() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "user") {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "user";
      const payload = {
        ...formData,
        createdBy: "user",
        addedBy: username,
      };

      const res = await fetch("/api/letters/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("पत्राची यशस्वी नोंदणी झाली!");
        setTimeout(() => {
          router.push("/letters");
        }, 1500);
      } else {
        toast.error(data.message || "नोंदणी सबमिट करण्यास अपयश आले.");
      }
    } catch (error) {
      console.error(error);
      toast.error("फॉर्म सबमिट करताना एरर आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>नवीन पत्र नोंदणी – Smt Mayuri Rahul Kokate</title>
        <meta name="description" content="Add a new inward letter under your management." />
      </Head>

      <LetterForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        backPath="/letters"
        createdBy="user"
      />
    </>
  );
}
