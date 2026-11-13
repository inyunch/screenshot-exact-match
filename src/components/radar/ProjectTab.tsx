export function ProjectTab() {
  return (
    <article className="mx-auto max-w-3xl space-y-5 rounded-xl border bg-card p-6 text-base leading-relaxed text-foreground shadow-soft sm:p-8">
      <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">About the project</h2>
      <p>
        Michigan’s Great Lakes and over 11,000 inland lakes are under constant threat from invasive zebra and quagga
        mussels. While they first arrived in the Great Lakes via ship ballast water, they spread from lake to lake on
        recreational boats. Once established, these mussels strip plankton from the water—starving native Michigan fish
        like whitefish and perch—while depleting near-bottom oxygen and destabilizing the ecosystem.
      </p>
      <p>
        Because it’s nearly impossible to remove mussels once a lake is invaded, Michigan prioritizes prevention and
        early detection. Inspired by Minnesota’s boater-movement risk models, we built a dashboard designed for both
        government agencies and everyday nature lovers:
      </p>
      <ul className="space-y-3 pl-5 list-disc marker:text-primary">
        <li>
          <strong>An Invasion Risk Score</strong> based on boat movement between lakes, helping government agencies and
          local conservation teams decide where to place boat-wash stations and inspections.
        </li>
        <li>
          <strong>Live Mussel &amp; Water Quality Tracking</strong> showing mussel populations and water health,
          empowering boaters, anglers, and nature lovers to check lake conditions and avoid accidentally spreading
          invasives to new waters.
        </li>
      </ul>
      <p className="font-medium">
        Together, it turns data into action—helping Michigan protect its lakes before new invasions start.
      </p>
    </article>
  );
}
