import itertools

# Seats 0 to 7: 0, 2, 4, 6 are SIDES. 1, 3, 5, 7 are CORNERS.
# Facing center:
# immediate left of pos i is (i+1)%8
# immediate right of pos i is (i-1)%8
# opposite of pos i is (i+4)%8
# diagonally opposite of corner i is (i+4)%8

people = ['P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']

for p in itertools.permutations(people):
    pos = {p[i]: i for i in range(8)}
    # P and S opposite
    if (pos['P'] + 4) % 8 != pos['S']:
        continue
    # Q and T opposite
    if (pos['Q'] + 4) % 8 != pos['T']:
        continue
    # V to left of S, U to right of S
    if (pos['S'] + 1) % 8 != pos['V']:
        continue
    if (pos['S'] - 1) % 8 != pos['U']:
        continue
    # W directly opposite V
    if (pos['V'] + 4) % 8 != pos['W']:
        continue
    # R occupies one of corner seats
    if pos['R'] % 2 != 1:
        continue
    
    # who is diagonally opposite to R?
    diag_R = None
    for name, seat in pos.items():
        if seat == (pos['R'] + 4) % 8:
            diag_R = name
    print(f"Valid arrangement found! R is at {pos['R']}, Diagonally opposite to R is: {diag_R}")
    print(pos)
    break
