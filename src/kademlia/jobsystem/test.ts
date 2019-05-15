import JobSystem from ".";

const string = async (s: string, timeout?: number) => {
  await new Promise(r => setTimeout(r, timeout));
  return s;
};

describe("jobsystem", () => {
  //   test(
  //     "unit",
  //     async () => {
  //       const jobsys = new JobSystem({ a: 3 });
  //       const ev = jobsys.add(string, ["s"]);
  //       const res = await ev.asPromise();
  //       expect(res).toBe("s");
  //       expect(jobsys.jobs.length).toBe(0);
  //     },
  //     1000 * 60
  //   );

  test(
    "multi",
    async () => {
      const jobsys = new JobSystem({ a: 3 });
      const ev1 = jobsys.add(string, ["1", 1]);
      const ev2 = jobsys.add(string, ["2", 1]);
      const ev3 = jobsys.add(string, ["3", 1]);
      const ev4 = jobsys.add(string, ["4", 2]);
      expect(jobsys.jobs.length).toBe(1);

      const d = await ev3;
      expect(d).toBe("3");
      expect(jobsys.jobs.length).toBe(0);

      const res = await ev4;
      expect(res).toBe("4");
    },
    1000 * 60
  );
});
