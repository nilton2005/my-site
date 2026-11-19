// Content of this sub-article's optional <Dato /> panels. Each line accepts inline HTML.
// Sources: the history of hash tables (Knuth, The Art of Computer Programming, vol. 3), the papers by
// Bloom (1970) and Karger et al. (1997), the Git 2.11 release notes, the Redis documentation and the Linux
// kernel's guide to submitting patches.

export const historia = [
  `<strong>1953.</strong> Hans Peter Luhn, at IBM, describes in an internal memo the idea of spreading keys into "buckets" with a function: the beginning of hash tables.`,
  `<strong>1970.</strong> Burton Bloom publishes the filter that bears his name: a tiny structure that answers "definitely not there" or "probably there". It accepts being a little wrong in exchange for taking far less space.`,
  `<strong>1997.</strong> David Karger and his team at MIT present <em>consistent hashing</em>: spreading data across servers so that, if one is added or goes down, only a few keys move. The next year Akamai is founded on that idea.`,
  `<strong>2016, Git 2.11.</strong> Git stops always using 7 characters for the short hash: it computes the length from how many objects the repository has, so the probability of an ambiguous prefix stays low.`,
];

export const curiosos = [
  `<strong>The birthday paradox.</strong> With 23 people in a room, the probability that two share a birthday is already over 50%. With 70, it's over 99.9%. It's the same calculation as the one for short hashes.`,
  `The Linux kernel asks you to cite commits with <strong>at least 12 characters</strong> of the hash: in a repository with millions of objects, 7 are no longer enough for the prefix to be unique.`,
  `Redis doesn't check every key to delete the expired ones: about 10 times a second it takes <strong>20 random keys</strong> with an expiry and, if more than 25% have expired, it repeats. A sample tells it how much cleaning is left.`,
  `Redis can count how many <strong>distinct</strong> elements there are (unique visitors, for example) using about 12 KB of memory, with a standard error of 0.81%: that's the HyperLogLog algorithm, behind <code>PFCOUNT</code>.`,
];

export const usos = [
  `<strong>Databases.</strong> Cassandra and RocksDB check a Bloom filter before reading from disk: if it says "definitely not there", they skip the read.`,
  `<strong>Distributed data.</strong> Cassandra and Amazon's Dynamo design spread keys across nodes with <em>consistent hashing</em>.`,
  `<strong>Observability.</strong> Keeping every trace of a large system is expensive; OpenTelemetry lets you keep a random percentage (say, 1%) and, with many requests, that sample describes the whole well.`,
  `<strong>Testing.</strong> Property-based tests (like fast-check in JavaScript) generate hundreds of random inputs to look for the case that breaks your function, instead of trusting three hand-written examples.`,
];
