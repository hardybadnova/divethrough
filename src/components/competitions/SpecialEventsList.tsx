
import { motion } from "framer-motion";
import { Sparkles, Users, Calendar, ArrowRight } from "lucide-react";
import { SpecialEvent } from "@/contexts/game/gameContextTypes";
import { useGame } from "@/contexts/GameContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

interface SpecialEventsListProps {
  events: SpecialEvent[];
}

export const SpecialEventsList = ({ events }: SpecialEventsListProps) => {
  const { joinSpecialEvent } = useGame();

  if (events.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No Special Events</h3>
        <p className="text-muted-foreground">Check back later for upcoming events</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {events.map((event) => (
        <Card key={event.id} className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {event.name}
            </CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.currentParticipants}/{event.maxParticipants} Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Starts {new Date(event.startDate).toLocaleDateString()}</span>
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold">
                  Prize Pool: {formatCurrency(event.prizePool)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Entry: {formatCurrency(event.entryFee)}
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <p className="font-medium">Special Rules:</p>
                <ul className="list-disc list-inside space-y-1">
                  {event.specialRules.map((rule) => (
                    <li key={rule.id} className="text-xs">
                      {rule.name}: {rule.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => joinSpecialEvent(event.id)}
              disabled={event.currentParticipants >= event.maxParticipants}
            >
              {event.currentParticipants >= event.maxParticipants ? (
                "Event Full"
              ) : (
                <>
                  Join Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </motion.div>
  );
};
