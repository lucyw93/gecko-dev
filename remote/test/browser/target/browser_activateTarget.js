/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function raisesWithoutArguments({ Target }, _, tab) {
  await getDiscoveredTargets(Target);

  let errorThrown = false;
  try {
    await Target.activateTarget();
  } catch (e) {
    errorThrown = true;
  }
  ok(errorThrown, "activateTarget raised error without an argument");
});

add_task(async function raisesWithUnknownTargetId({ Target }, _, tab) {
  await getDiscoveredTargets(Target);

  let errorThrown = false;
  try {
    await Target.activateTarget({ targetId: "-1" });
  } catch (e) {
    errorThrown = true;
  }
  ok(errorThrown, "activateTarget raised error with unkown target id");
});

add_task(async function selectTabInOtherWindow({ Target }, _, tab) {
  const targets = await getDiscoveredTargets(Target);
  const filtered_targets = targets.filter(target => {
    return target.targetInfo.targetId == tab.linkedBrowser.browsingContext.id;
  });
  is(filtered_targets.length, 1, "The current target has been found");
  const initialTarget = filtered_targets[0];

  is(tab.ownerGlobal, getFocusedNavigator(), "Initial window is focused");

  // open some more tabs in the initial window
  await openTab(Target);
  await openTab(Target);
  const lastTabFirstWindow = await openTab(Target);
  is(
    gBrowser.selectedTab,
    lastTabFirstWindow.newTab,
    "Last openend tab in initial window is the selected tab"
  );

  const { newWindow } = await openWindow(Target);

  const lastTabSecondWindow = await openTab(Target);
  is(
    gBrowser.selectedTab,
    lastTabSecondWindow.newTab,
    "Last openend tab in new window is the selected tab"
  );

  try {
    is(newWindow, getFocusedNavigator(), "The new window is focused");
    await Target.activateTarget({
      targetId: initialTarget.targetInfo.targetId,
    });
    is(
      tab.ownerGlobal,
      getFocusedNavigator(),
      "Initial window is focused again"
    );
    is(gBrowser.selectedTab, tab, "Selected tab is the initial tab again");
  } finally {
    await BrowserTestUtils.closeWindow(newWindow);
  }
});

function getFocusedNavigator() {
  return Services.wm.getMostRecentWindow("navigator:browser");
}
