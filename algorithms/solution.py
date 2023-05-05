s = input()
t = input()

# Use dp to solve the problem, the value in the cell is the number of prefix matched. 

# Save index[0][idx] to 1 if s[idx] == t[0]
index = [[0 for i in range(len(s))] for j in range(len(t))]
for idxs, sc in enumerate(s):
    if sc == t[0]:
        index[0][idxs] = 1

# loop t
for idxt, tc in enumerate(t):
    if idxt == 0:
        continue
    sum = 0
    for idxs, sc in enumerate(s):
        # If sc == tc, put the sum into the cell, indicates that there is "sum" posibilities that match the prefix
        if sc == tc:
            index[idxt][idxs] = sum
        # Add the number of previous row and before current column to count the number of matched prefix
        sum += index[idxt-1][idxs]

# for arr in index:
#     print(arr)

ans = 0
for i in index[-1]:
    ans += i

print(ans)