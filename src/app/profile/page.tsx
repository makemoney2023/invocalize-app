'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  if (!isLoaded || !user) {
    return null;
  }

  const handleUpdateProfile = async () => {
    try {
      await user.update({
        firstName,
        lastName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateProfile}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <p>{user.emailAddresses[0].emailAddress}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <p>
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

