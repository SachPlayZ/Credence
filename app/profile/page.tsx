"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Info,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image: string;
  age: number | null;
  gender: string | null;
  bio: string | null;
  location: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EditableField {
  key: "age" | "gender" | "bio" | "location" | "phoneNumber";
  label: string;
  type: "text" | "number" | "select" | "textarea";
  options?: { value: string; label: string }[];
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const editableFields: EditableField[] = [
    { key: "age", label: "Age", type: "number" },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
        { value: "prefer_not_to_say", label: "Prefer not to say" },
      ],
    },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "location", label: "Location", type: "text" },
    { key: "phoneNumber", label: "Phone Number", type: "text" },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      toast.error("Failed to load profile");
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (
    field: string,
    value: string | number | null | undefined
  ) => {
    setEditingField(field);
    if (value === undefined) {
      setTempValue("");
    } else {
      setTempValue(value?.toString() || "");
    }
  };

  const handleSave = async (field: string) => {
    setIsSaving(true);
    try {
      const updatedData = {
        ...profile,
        [field]: field === "age" ? parseInt(tempValue) : tempValue,
      };

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditingField(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const renderEditableField = (field: EditableField) => {
    const isEditing = editingField === field.key;
    const value = profile?.[field.key];
    const displayValue = value || "Not set";

    if (isEditing) {
      switch (field.type) {
        case "select":
          return (
            <div className="flex items-center gap-2">
              <Select value={tempValue} onValueChange={setTempValue}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white w-48">
                  <SelectValue
                    placeholder={`Select ${field.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="ghost"
                className="text-green-500 hover:text-green-600"
                onClick={() => handleSave(field.key)}
                disabled={isSaving}
              >
                <Check size={16} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500 hover:text-red-600"
                onClick={handleCancel}
              >
                <X size={16} />
              </Button>
            </div>
          );
        case "textarea":
          return (
            <div className="flex items-start gap-2">
              <Textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[100px] w-full"
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-green-500 hover:text-green-600"
                  onClick={() => handleSave(field.key)}
                  disabled={isSaving}
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={handleCancel}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          );
        default:
          return (
            <div className="flex items-center gap-2">
              <Input
                type={field.type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="bg-white/5 border-white/10 text-white w-48"
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
              <Button
                size="icon"
                variant="ghost"
                className="text-green-500 hover:text-green-600"
                onClick={() => handleSave(field.key)}
                disabled={isSaving}
              >
                <Check size={16} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500 hover:text-red-600"
                onClick={handleCancel}
              >
                <X size={16} />
              </Button>
            </div>
          );
      }
    }

    return (
      <div className="flex items-center justify-between group">
        <span className="text-gray-300">{displayValue}</span>
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
          onClick={() => handleEdit(field.key, value)}
        >
          <Edit2 size={16} />
        </Button>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 backdrop-blur-lg rounded-xl p-8 border border-white/10"
          >
            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500">
                {profile?.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <User size={40} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile?.name}
                </h1>
                <p className="text-gray-400">{profile?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated{" "}
                  {profile?.updatedAt
                    ? new Date(profile.updatedAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {editableFields.map((field) => (
                <div key={field.key} className="flex items-center gap-4">
                  <div className="w-40 flex items-center gap-2 text-gray-400">
                    {field.key === "age" && <Calendar size={16} />}
                    {field.key === "gender" && <User size={16} />}
                    {field.key === "bio" && <Info size={16} />}
                    {field.key === "location" && <MapPin size={16} />}
                    {field.key === "phoneNumber" && <Phone size={16} />}
                    {field.label}
                  </div>
                  <div className="flex-1">{renderEditableField(field)}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
