"use client";

import { Fragment, use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { emailVerifyApi, sendEmailVerificationCodeApi } from "@/api/auth";
import { toast } from "react-toastify";
import { UserContext } from "@/store/User_Context";
import { Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";

export default function Page() {
    const { auth, isAuhtLoading, signInHandler } = use(UserContext)
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuhtLoading && auth?.role) {
            if (auth.isEmailVerified) {
                toast.info("Your Email is Already Verified. Redirecting...")
                setTimeout(() => {
                    let link = "/learner"
                    if (!auth?.business_course_id) {
                        link = "/learner/get-started"
                    }
                    redirect(link)
                }, 1200);
            }
        }
    }, [isAuhtLoading])

    const handleSendCode = async () => {
        setLoading(true);
        try {
            const resp = await sendEmailVerificationCodeApi()
            if (resp.error) {
                throw new Error(resp.data)
            }
            else {
                toast.success(resp.data)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!token) return
        setLoading(true);
        try {
            const resp = await emailVerifyApi({ code: token })
            if (resp.error) {
                throw new Error(resp.data)
            }
            else {
                if (resp.userData && resp.token) {
                    signInHandler(resp.userData, resp.token)
                }
                toast.success(resp.data)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 w-full">
            <Tabs defaultValue="send" className="mx-auto w-[400px]">
                <TabsList className="grid w-full grid-cols-2 border-2 border-gray-500">
                    <TabsTrigger className="shadow-black" value="send">Send Code</TabsTrigger>
                    <TabsTrigger className="shadow-black" value="verify">Verify Code</TabsTrigger>
                </TabsList>
                <TabsContent value="send">
                    <Card>
                        <CardFooter>
                            <Button onClick={handleSendCode} disabled={loading}>
                                {loading ? <Fragment>
                                    <Loader /> Sending...
                                </Fragment> : "Send Verification Code"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="verify">
                    <Card>
                        <CardContent className="space-y-2">
                            <Label htmlFor="token">Verification Code</Label>
                            <Input type="text"
                                id="token"
                                placeholder="Write your verify code here..."
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleVerifyCode} disabled={loading || !token}>
                                {loading ? <Fragment>
                                    <Loader />  Verifying...
                                </Fragment> : "Verify Code"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
