import { ActivityType } from "@m2c2kit/core";
import { Session } from "@m2c2kit/session";
import { LocalDatabase } from "@m2c2kit/db";
import { ColorShapes } from "@m2c2kit/assessment-color-shapes";
import { ColorDots } from "@m2c2kit/assessment-color-dots";
import { GridMemory } from "@m2c2kit/assessment-grid-memory";
import { SymbolSearch } from "@m2c2kit/assessment-symbol-search";
import { CliStarter } from "@m2c2kit/assessment-cli-starter";
import { Survey } from "@m2c2kit/survey";
import { surveyJson } from "./surveyJson";

const a1 = new ColorShapes();
const a2 = new ColorDots();
const a3 = new GridMemory();
const a4 = new SymbolSearch();
const a5 = new CliStarter();
const survey = new Survey(surveyJson);

const activities = [a1, a2, a3, a4, a5, survey];

const db = new LocalDatabase();

const session = new Session({
  activities: activities,
  dataStores: [db],
});

/**
 * An event handler provided to session.onActivityData() will be called
 * when a trial or survey question is completed. It will be passed an
 * ActivityResultsEvent object, which is named ev in the example below.
 *
 * The event handler is where you insert code to post data to an API or, in
 * the example below, simply log the data to the console.
 *
 * ev.newData is the data that was just generated by the completed trial or
 * survey question.
 * ev.data is all the data, cumulative of all trials or questions in the
 * activity, that have been generated.
 *
 * We separate out newData from data in case you want to alter the execution
 * based on the most recent trial, e.g., maybe you want to stop after
 * a certain user behavior or performance threshold in the just completed
 * trial.
 *
 * ev.activityConfiguration is the game parameters that were used.
 *
 * The schema for all of the above are in JSON Schema format.
 * Currently, only games generate schema.
 */
session.onActivityData((ev) => {
  if (ev.target.type === ActivityType.Game) {
    console.log(`✅ trial completed:`);
  } else if (ev.target.type === ActivityType.Survey) {
    console.log(`✅ survey response completed:`);
  }
  console.log("  newData: " + JSON.stringify(ev.newData));
  console.log("  newData schema: " + JSON.stringify(ev.newDataSchema));
  console.log("  data: " + JSON.stringify(ev.data));
  console.log("  data schema: " + JSON.stringify(ev.dataSchema));
  console.log(
    "  activity parameters: " + JSON.stringify(ev.activityConfiguration),
  );
  console.log(
    "  activity parameters schema: " +
      JSON.stringify(ev.activityConfigurationSchema),
  );

  db.saveActivityResults(ev).catch((err) => {
    console.error("Could not save results to local database. err: " + err);
  });
});

/**
 * Make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or a mobile WebView.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).m2c2kitSession = session;
session.initialize();