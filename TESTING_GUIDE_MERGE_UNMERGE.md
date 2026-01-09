# Manual Testing Guide - Merge/Unmerge Products

## Prerequisites
- Admin account with login credentials
- At least 3-5 test products in the database
- Products should have different types/categories for better testing

## Test Scenarios

### Scenario 1: Basic Merge Operation
**Objective**: Verify products can be merged into a group

**Steps**:
1. Login as admin
2. Navigate to `/admin/upload.html`
3. Click "Load Products" button
4. Click "Manage Groups" button
5. Select 2-3 products by checking their checkboxes
6. Verify "X selected" count updates correctly
7. Enter group name: "Test Group 1"
8. Click "Merge Selected" button
9. Confirm the dialog
10. Wait for success message
11. Click "Load Products" to refresh
12. Verify selected products now show "📦 Test Group 1" badge

**Expected Results**:
- ✅ Selected count updates correctly
- ✅ Success alert appears with count
- ✅ Products show group badge after refresh
- ✅ Badge appears in both line and panel views

---

### Scenario 2: Basic Unmerge Operation
**Objective**: Verify products can be unmerged from a group

**Steps**:
1. Ensure you have products in a group (from Scenario 1)
2. Click "Manage Groups" button
3. Select products that are in "Test Group 1"
4. Click "Unmerge Selected" button (don't enter group name)
5. Confirm the dialog
6. Wait for success message
7. Click "Load Products" to refresh
8. Verify products no longer show group badge

**Expected Results**:
- ✅ Unmerge works without group name
- ✅ Success alert appears with count
- ✅ Group badges disappear after refresh
- ✅ Products can be individually viewed

---

### Scenario 3: Remerge to Different Group
**Objective**: Verify products can be moved from one group to another

**Steps**:
1. Merge products into "Test Group A" (follow Scenario 1)
2. Click "Manage Groups" button
3. Select the same products
4. Enter NEW group name: "Test Group B"
5. Click "Merge Selected" button
6. Confirm the dialog
7. Click "Load Products" to refresh
8. Verify products now show "📦 Test Group B" badge

**Expected Results**:
- ✅ Products move to new group
- ✅ Old group badge replaced with new one
- ✅ No duplicate badges
- ✅ Clean transition between groups

---

### Scenario 4: Merge Mixed Products
**Objective**: Merge unmerged products with already-merged products

**Steps**:
1. Have Product A in "Group 1" (merged)
2. Have Products B & C unmerged
3. Click "Manage Groups" button
4. Select all three products (A, B, C)
5. Enter group name: "Combined Group"
6. Click "Merge Selected"
7. Confirm
8. Refresh
9. Verify all three products show "📦 Combined Group"

**Expected Results**:
- ✅ All products merge into new group
- ✅ Both previously merged and unmerged products handled correctly
- ✅ Single unified group badge for all

---

### Scenario 5: Cancel Operation
**Objective**: Verify cancel functionality works correctly

**Steps**:
1. Click "Manage Groups" button
2. Select some products
3. Enter group name
4. Click "Cancel" button
5. Verify selections cleared
6. Verify UI returns to normal view
7. Click "Manage Groups" again
8. Select products
9. Click "Merge Selected" but cancel the confirmation dialog
10. Verify no changes made

**Expected Results**:
- ✅ Cancel button clears selections
- ✅ UI exits manage mode
- ✅ Checkboxes disappear
- ✅ No changes saved when confirming dialog is cancelled

---

### Scenario 6: View Toggle During Manage Mode
**Objective**: Verify checkboxes work in both line and panel views

**Steps**:
1. Click "Manage Groups" button
2. In line view: Select 2 products
3. Verify checkboxes are checked
4. Click view toggle to switch to panel view
5. Verify same products show green border
6. Click view toggle back to line view
7. Verify checkboxes still checked
8. Complete merge operation
9. Verify success

**Expected Results**:
- ✅ Selections persist across view changes
- ✅ Visual indicators work in both views
- ✅ Line view: checkboxes
- ✅ Panel view: green border + checkbox overlay

---

### Scenario 7: Large Batch Operations
**Objective**: Test batch size limits

**Steps**:
1. Attempt to select 100 products
2. Merge them into "Batch Test"
3. Verify success
4. Attempt to select 101 products (if available)
5. Try to merge
6. Verify error message about 100 limit

**Expected Results**:
- ✅ 100 products can be merged
- ✅ 101+ products rejected with clear error
- ✅ Error message mentions 100 limit

---

### Scenario 8: Filter and Search During Manage Mode
**Objective**: Verify filters work during group management

**Steps**:
1. Click "Manage Groups" button
2. Select 2 products
3. Apply a product type filter (e.g., only "decor")
4. Verify filtered view still shows checkboxes
5. Select more products from filtered view
6. Clear filter
7. Verify all selections preserved
8. Complete merge

**Expected Results**:
- ✅ Filters work in manage mode
- ✅ Selections persist through filtering
- ✅ Checkboxes visible on filtered products
- ✅ Merge works across filter changes

---

### Scenario 9: Error Handling
**Objective**: Test error conditions

**Test A - Empty Group Name**:
1. Select products
2. Leave group name empty
3. Click "Merge Selected"
4. Verify alert: "Please enter a group name"

**Test B - No Products Selected (Merge)**:
1. Clear all selections
2. Enter group name
3. Click "Merge Selected"
4. Verify alert: "Please select at least one product"

**Test C - No Products Selected (Unmerge)**:
1. Clear all selections
2. Click "Unmerge Selected"
3. Verify alert: "Please select at least one product"

**Expected Results**:
- ✅ Clear error messages for each scenario
- ✅ No server requests made for invalid operations
- ✅ UI remains stable after errors

---

### Scenario 10: Visual Indicators
**Objective**: Verify all visual indicators work correctly

**Steps**:
1. Load products list (not in manage mode)
2. Note which products have group badges
3. Enter "Manage Groups" mode
4. Verify UI changes:
   - Checkboxes appear
   - "Manage Groups" button hidden
   - Merge controls visible
   - Action buttons (Edit/Delete) hidden
5. Exit manage mode
6. Verify UI reverts:
   - Checkboxes gone
   - "Manage Groups" button visible
   - Action buttons visible

**Expected Results**:
- ✅ Group badges (📦) clearly visible
- ✅ Purple color for badges (#6e33b7)
- ✅ Manage mode changes UI appropriately
- ✅ Clean transition between modes

---

## Verification Checklist

After completing all scenarios, verify:

- [ ] Products can be merged into groups
- [ ] Products can be unmerged from groups
- [ ] Products can be remerged to different groups
- [ ] Group badges appear correctly
- [ ] Group badges disappear after unmerge
- [ ] Both line and panel views work
- [ ] Selections persist across view changes
- [ ] Filters work during manage mode
- [ ] All error messages are clear and helpful
- [ ] UI transitions are smooth
- [ ] No console errors during operations
- [ ] Success/error messages are accurate
- [ ] Batch size limits enforced (100 max)

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## Performance Testing

- [ ] Test with 10 products - should be instant
- [ ] Test with 50 products - should be smooth
- [ ] Test with 100 products - should complete within 2-3 seconds

## Notes for Testers

**Important Points**:
- Group names are case-sensitive
- The "Manage Groups" button was renamed from "Merge Products" for clarity
- Unmerge doesn't require a group name (just select products and click Unmerge)
- Remerge works by selecting grouped products and merging them to a new group name

**Known Limitations**:
- Maximum 100 products per operation
- Requires admin authentication
- Changes require page refresh to fully update shop page

**Common Issues**:
- If badges don't update, click "Load Products" to refresh
- If checkboxes don't appear, ensure "Manage Groups" is clicked
- If merge fails, check admin token is valid (try re-login)
