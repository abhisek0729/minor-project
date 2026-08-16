"use client";

import { useState } from "react";
import { Save, User, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+977-1-234-5678",
    location: "Kathmandu, Nepal",
    bio: "Travel enthusiast and adventure seeker. Love exploring new places and experiencing local cultures.",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Profile Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-12 w-12" />
              </div>
              <Button className="mt-4" variant="outline" size="sm">
                Change Picture
              </Button>
            </CardContent>
          </Card>

          {/* Main Profile Form */}
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Location
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Bio
                </label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections */}
        <div className="mt-8 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-foreground">
                  Receive booking notifications
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-foreground">
                  Receive promotional emails
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-foreground">
                  Enable dark mode
                </span>
              </label>
            </CardContent>
          </Card>

          <Card className="border-border border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Logout</p>
                <p className="text-sm text-muted-foreground">
                  Sign out from your account
                </p>
              </div>
              <Button variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
