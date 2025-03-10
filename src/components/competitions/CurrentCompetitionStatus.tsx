
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Sparkles, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export const CurrentCompetitionStatus = () => {
  const { 
    getCurrentLeague, 
    getCurrentTournament, 
    getCurrentSpecialEvent 
  } = useGame();

  const currentLeague = getCurrentLeague();
  const currentTournament = getCurrentTournament();
  const currentSpecialEvent = getCurrentSpecialEvent();
  
  const hasActiveCompetition = currentLeague || currentTournament || currentSpecialEvent;

  if (!hasActiveCompetition) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>No Active Competitions</CardTitle>
          <CardDescription>
            You're not currently participating in any competitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Join a league, tournament, or special event to compete for prizes!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {currentLeague && (
        <Card className="relative overflow-hidden border-l-4 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {currentLeague.name}
              </CardTitle>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">League</Badge>
            </div>
            <CardDescription>{currentLeague.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Ends {new Date(currentLeague.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentLeague.currentParticipants}/{currentLeague.maxParticipants} Players
                  </span>
                </div>
              </div>
              <div className="text-sm mt-2">
                <span className="font-medium">Prize Pool:</span> {formatCurrency(currentLeague.prizePool)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Current Round:</span> {currentLeague.rounds[0].name}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentTournament && (
        <Card className="relative overflow-hidden border-l-4 border-green-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {currentTournament.name}
              </CardTitle>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">Tournament</Badge>
            </div>
            <CardDescription>{currentTournament.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Ends {new Date(currentTournament.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentTournament.currentParticipants}/{currentTournament.maxParticipants} Players
                  </span>
                </div>
              </div>
              <div className="text-sm mt-2">
                <span className="font-medium">Prize Pool:</span> {formatCurrency(currentTournament.prizePool)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Format:</span> {currentTournament.format}
              </div>
              <div className="text-sm">
                <span className="font-medium">Current Round:</span> {currentTournament.rounds[0].name}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentSpecialEvent && (
        <Card className="relative overflow-hidden border-l-4 border-purple-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                {currentSpecialEvent.name}
              </CardTitle>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Special Event</Badge>
            </div>
            <CardDescription>{currentSpecialEvent.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Ends {new Date(currentSpecialEvent.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentSpecialEvent.currentParticipants}/{currentSpecialEvent.maxParticipants} Players
                  </span>
                </div>
              </div>
              <div className="text-sm mt-2">
                <span className="font-medium">Prize Pool:</span> {formatCurrency(currentSpecialEvent.prizePool)}
              </div>
              {currentSpecialEvent.specialRules.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-medium">Special Rules:</span>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {currentSpecialEvent.specialRules.map((rule) => (
                      <li key={rule.id} className="text-xs">
                        {rule.name}: {rule.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
