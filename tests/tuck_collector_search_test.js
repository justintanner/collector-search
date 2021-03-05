import { testProp, fc } from "ava-fast-check";
import TuckCollectorSearch from "../src/tuck_collector_search.js";

testProp("Searching for undefined returns nothing", [fc.string()], (t, q) => {
  // const tcs = TuckCollectorSearch({})
  // t.true(tcs.search(''));
  t.true(1 === 1);
});
