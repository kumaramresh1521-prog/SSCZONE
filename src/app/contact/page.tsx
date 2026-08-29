"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent successfully. We will get back to you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSubmitting(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            We're Here to Help
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight">
            Contact SSCZone Support
          </h1>
          <p className="mt-3 text-base text-blue-100 max-w-xl mx-auto">
            Have questions about subscription plans, test series, or syllabus content? Reach out to us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-12">
          {/* Contact Details Card */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" /> Get in Touch
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our customer support team is available Monday to Saturday (9:00 AM – 7:00 PM IST) to assist with any platform inquiries.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Email Us</p>
                    <a href="mailto:support@ssczone.com" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
                      support@ssczone.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Helpline</p>
                    <p className="text-sm font-semibold text-gray-900">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Office Location</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      SSCZone Education Technologies, New Delhi, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="md:col-span-7">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-gray-900">Send Us a Message</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Question regarding SSC CGL Pass"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message or inquiry here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Submit Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
