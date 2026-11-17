--------------------------- MODULE ComparePrices ---------------------------
\* Comparing shelf prices in the app, as the shopper sees it.
VARIABLES screen, units

vars == <<screen, units>>

Init == screen = "empty" /\ units = 0

AddFirst == screen = "empty" /\ screen' = "one" /\ units' = 1
AddSameUnit == screen \in {"one", "ranked"} /\ screen' = "ranked" /\ UNCHANGED units
AddOtherUnit == screen \in {"one", "ranked"} /\ units = 1 /\ screen' = "ranked" /\ units' = 2
BadInput == screen \in {"empty", "one", "ranked"} /\ UNCHANGED vars
ClearList == screen # "empty" /\ screen' = "empty" /\ units' = 0
LoadDemo == screen' = "ranked" /\ units' = 1

Next == AddFirst \/ AddSameUnit \/ AddOtherUnit \/ BadInput \/ ClearList \/ LoadDemo

Spec == Init /\ [][Next]_vars

OneBestBuyPerUnit == screen = "ranked" => units \in {1, 2}
=============================================================================
