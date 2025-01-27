"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Check,
  X,
  Mail,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
}

interface FriendRequest {
  id: string;
  from: string;
  to: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: any;
}

export default function SocialPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen for friend requests
    const requestsQuery = query(
      collection(db, "friendRequests"),
      where("to", "==", user.uid)
    );

    const sentRequestsQuery = query(
      collection(db, "friendRequests"),
      where("from", "==", user.uid)
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, async (snapshot) => {
      const requests: FriendRequest[] = [];
      for (const doc of snapshot.docs) {
        const request = doc.data() as FriendRequest;

        requests.push({
          ...request,
          id: doc.id,
        });
      }
      setPendingRequests(requests.filter(r => r.status === "pending"));
    });

    const unsubscribeSentRequests = onSnapshot(sentRequestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as FriendRequest[];
      setSentRequests(requests.filter(r => r.status === "pending"));
    });

    // Load friends
    const loadFriends = async () => {
      const friendsQuery = query(
        collection(db, "friendRequests"),
        where("status", "==", "accepted"),
        where("to", "==", user.uid)
      );
      const friendsQuery2 = query(
        collection(db, "friendRequests"),
        where("status", "==", "accepted"),
        where("from", "==", user.uid)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(friendsQuery),
        getDocs(friendsQuery2)
      ]);

      const friendIds = new Set([
        ...snapshot1.docs.map(doc => doc.data().from),
        ...snapshot2.docs.map(doc => doc.data().to)
      ]);

      const friendProfiles: UserProfile[] = [];
      for (const friendId of friendIds) {
        const userDoc = await getDoc(doc(db, "users", friendId));
        if (userDoc.exists()) {
          friendProfiles.push({
            uid: userDoc.id,
            ...userDoc.data()
          } as UserProfile);
        }
      }

      setFriends(friendProfiles);
    };

    loadFriends();

    return () => {
      unsubscribeRequests();
      unsubscribeSentRequests();
    };
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    setIsLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", ">=", searchQuery.toLowerCase()),
        where("email", "<=", searchQuery.toLowerCase() + "\uf8ff")
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        .filter(u => u.uid !== user.uid) as UserProfile[];

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (toUser: UserProfile) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "friendRequests"), {
        from: user.uid,
        to: toUser.uid,
        status: "pending",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleRequest = async (requestId: string, accept: boolean) => {
    try {
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, {
        status: accept ? "accepted" : "rejected"
      });
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    try {
      const q1 = query(
        collection(db, "friendRequests"),
        where("from", "==", user.uid),
        where("to", "==", friendId),
        where("status", "==", "accepted")
      );
      const q2 = query(
        collection(db, "friendRequests"),
        where("from", "==", friendId),
        where("to", "==", user.uid),
        where("status", "==", "accepted")
      );

      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const deletePromises = [
        ...snapshot1.docs.map(doc => deleteDoc(doc.ref)),
        ...snapshot2.docs.map(doc => deleteDoc(doc.ref))
      ];

      await Promise.all(deletePromises);
      setFriends(friends.filter(f => f.uid !== friendId));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "friendRequests", requestId));
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Social</h1>
      </div>

      <Tabs defaultValue="friends">
        <TabsList className="mb-4">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="find">Find People</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">My Friends</h2>
            {friends.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                You havent added any friends yet
              </p>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.uid}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {friend.displayName?.[0] || friend.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{friend.displayName || "User"}</p>
                          <p className="text-sm text-muted-foreground">{friend.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFriend(friend.uid)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <div className="grid gap-4">
            {/* Received Requests */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Received Requests</h2>
              {pendingRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending friend requests
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <p>Friend request from {request.from}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequest(request.id, true)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRequest(request.id, false)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Sent Requests */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Sent Requests</h2>
              {sentRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No sent friend requests
                </p>
              ) : (
                <div className="space-y-2">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <p>Request sent to {request.to}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelRequest(request.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="find">
          <Card className="p-4">
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.uid}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {result.displayName?.[0] || result.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{result.displayName || "User"}</p>
                        <p className="text-sm text-muted-foreground">{result.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendFriendRequest(result)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Search for users to add them as friends
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}