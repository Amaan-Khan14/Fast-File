import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
    return (
        <div>
            <Card className="bg-inherit">
                <CardHeader>
                    <CardTitle>
                        Dashboard
                    </CardTitle>
                    <CardDescription>
                        Welcome to the dashboard!
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}