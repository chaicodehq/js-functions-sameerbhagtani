/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
    const votes = {};
    const registeredVoters = new Set();

    return {
        registerVoter: (voter) => {
            if (
                typeof voter !== "object" ||
                voter === null ||
                !voter.id ||
                !voter.name ||
                !voter.age ||
                voter.age < 18
            )
                return false;

            for (const registeredVoter of registeredVoters) {
                if (registeredVoter.id === voter.id) return false;
            }

            registeredVoters.add(voter);
            return true;
        },

        castVote: (voterId, candidateId, onSuccess, onError) => {
            let isRegistered = false;
            for (const registeredVoter of registeredVoters) {
                if (registeredVoter.id === voterId) isRegistered = true;
            }

            const candidateExists = Boolean(
                candidates.find((candidate) => candidate.id === candidateId),
            );

            const alreadyVoted = votes[voterId];

            if (!isRegistered) {
                return onError("Voter not registered");
            }

            if (!candidateExists) {
                return onError("Candidate does not exist");
            }

            if (alreadyVoted) {
                return onError("Voter has alredy voted");
            }

            votes[voterId] = candidateId;
            return onSuccess({ voterId, candidateId });
        },

        getResults: (sortFn) => {
            const result = [];

            candidates.forEach((candidate) => {
                const votesCount = Object.values(votes).filter(
                    (candidateId) => candidateId === candidate.id,
                ).length;
                result.push({ ...candidate, votes: votesCount });
            });

            if (sortFn) {
                return result.sort(sortFn);
            }

            return result.sort((a, b) => b.votes - a.votes);
        },

        getWinner: () => {
            if (Object.keys(votes).length === 0) return null;

            let max = -Infinity;
            let winner = null;

            candidates.forEach((candidate) => {
                const votesCount = Object.values(votes).filter(
                    (candidateId) => candidateId === candidate.id,
                ).length;

                if (votesCount > max) {
                    max = votesCount;
                    winner = candidate;
                }
            });

            return winner;
        },
    };
}

export function createVoteValidator(rules) {
    const { minAge, requiredFields } = rules;

    return (voter) => {
        for (const field of requiredFields) {
            if (!(field in voter)) {
                return {
                    valid: false,
                    reason: `${field} is missing`,
                };
            }
        }

        if (voter.age < minAge) {
            return {
                valid: false,
                reason: `Age is less than required`,
            };
        }

        return {
            valid: true,
        };
    };
}

export function countVotesInRegions(regionTree) {
    if (!regionTree) return 0;

    if (Array.isArray(regionTree)) {
        if (regionTree.length === 0) return 0;

        const first = regionTree[0];
        const rest = regionTree.slice(1);

        return countVotesInRegions(first) + countVotesInRegions(rest);
    }

    return regionTree.votes + countVotesInRegions(regionTree.subRegions);
}

export function tallyPure(currentTally, candidateId) {
    const copy = { ...currentTally };

    if (!(candidateId in copy)) {
        copy[candidateId] = 1;
    } else {
        copy[candidateId]++;
    }

    return copy;
}
