import { beforeEach, describe, expect, it } from "vitest";
import { GET as getAbrechnung } from "../app/api/abrechnung/route";
import { POST as postAbrechnungUpload } from "../app/api/abrechnung/upload/route";
import { DELETE as deleteAbrechnung } from "../app/api/abrechnung/[id]/route";
import { GET as getAbrechnungMonth } from "../app/api/abrechnung/[id]/[year]/route";
import { POST as postAbrechnungCompare } from "../app/api/abrechnung/[id]/compare/route";
import { POST as postAbrechnungConfirmBulk } from "../app/api/abrechnung/[id]/items/confirm/bulk/route";
import { POST as postAbrechnungDeleteBulk } from "../app/api/abrechnung/[id]/items/delete/bulk/route";
import { POST as postAbrechnungReklamationBulk } from "../app/api/abrechnung/[id]/reklamation/bulk/route";
import { GET as getAbrechnungReklamationenAll } from "../app/api/abrechnung/reklamationen/all/route";
import { POST as postAbrechnungReklamationenResolveBulk } from "../app/api/abrechnung/reklamationen/resolve/bulk/route";
import { GET as getAbrechnungUnresolvedAll } from "../app/api/abrechnung/unresolved/all/route";

import { GET as getHouses } from "../app/api/houses/route";
import { POST as postHousesBulk } from "../app/api/houses/bulk/route";
import { POST as postDoorsBulk } from "../app/api/doors/bulk/route";
import { PUT as putDoor, DELETE as deleteDoor } from "../app/api/doors/[id]/route";
import { GET as getDoorsPoints } from "../app/api/doors/points/route";
import { GET as getDoorsTeam } from "../app/api/doors/team/[id]/route";
import { GET as getDoorsAdminAll } from "../app/api/doors/admin/all/route";
import { GET as getDoorsPendingDeletions } from "../app/api/doors/admin/pending-deletions/route";
import { PATCH as patchDoorResolveDeletion } from "../app/api/doors/admin/[id]/resolve-deletion/route";
import { GET as getAreas, POST as postAreas } from "../app/api/areas/route";
import { PUT as putArea } from "../app/api/areas/[id]/route";
import { POST as postStreetAssignments } from "../app/api/street-assignments/route";
import { POST as postAddressesBulk } from "../app/api/addresses/bulk/route";
import { POST as postVisitsBulk } from "../app/api/visits/bulk/route";
import { GET as getLocationTrackingTeamCurrent } from "../app/api/location-tracking/team/[id]/current/route";

import { POST as postProductsBulk } from "../app/api/products/bulk/route";
import { GET as getProductsSales } from "../app/api/products/sales/route";
import { PATCH as patchProductsSalesStatus } from "../app/api/products/sales/[id]/status/route";
import { DELETE as deleteProduct } from "../app/api/products/[id]/route";
import { PATCH as patchProductAssignAdvisor } from "../app/api/products/[id]/assign-advisor/route";
import { PATCH as patchProductBattleExclude } from "../app/api/products/[id]/battle-exclude/route";
import { GET as getProductsTeam } from "../app/api/products/team/[id]/route";
import { GET as getProductsAdminAll } from "../app/api/products/admin/all/route";
import { GET as getProductsAdminExpiring } from "../app/api/products/admin/expiring/route";
import { DELETE as deleteTeamleiterSale } from "../app/api/teamleiter/sales/[id]/route";
import { PATCH as patchTeamleiterSaleStatus } from "../app/api/teamleiter/sales/[id]/status/route";
import { GET as getStrukturleiterDoors } from "../app/api/strukturleiter/doors/route";
import { GET as getStrukturleiterProducts } from "../app/api/strukturleiter/products/route";

import { GET as getLogbook } from "../app/api/logbook/route";
import { PUT as putLogbookMonth } from "../app/api/logbook/months/[month]/route";
import { PUT as putLogbookProfile } from "../app/api/logbook/profile/route";
import {
  GET as getChallenges,
  POST as postChallenges,
  PUT as putChallenges,
  PATCH as patchChallenges,
  DELETE as deleteChallenges,
} from "../app/api/challenges/[[...slug]]/route";
import { GET as getIncentives, POST as postIncentives } from "../app/api/incentives/route";
import { PUT as putIncentive, DELETE as deleteIncentive } from "../app/api/incentives/[id]/route";
import {
  GET as getCopilot,
  POST as postCopilot,
  DELETE as deleteCopilot,
} from "../app/api/copilot/[[...slug]]/route";
import { GET as getTeams } from "../app/api/teams/route";
import { GET as getTeamsPublicList } from "../app/api/teams/public/list/route";
import { GET as getTeamPerformanceHistory } from "../app/api/teams/[id]/performance-history/route";
import { GET as getMyTeamLicenses } from "../app/api/teams/my-team/licenses/route";
import { POST as postMyTeamLicensesUpdate } from "../app/api/teams/my-team/licenses/update/route";
import { POST as postMyTeamLicensesUpdateReferred } from "../app/api/teams/my-team/licenses/update-referred/route";
import { POST as postSimulateCommission } from "../app/api/simulate/commission/route";
import { GET as getSimulateTariffsGrouped } from "../app/api/simulate/tariffs-grouped/route";
import { GET as getTariffs } from "../app/api/tariffs/route";
import {
  GET as getEmailNotifications,
  POST as postEmailNotifications,
} from "../app/api/settings/email-notifications/route";
import { GET as getSubscriptionsCurrent } from "../app/api/subscriptions/current/route";
import { POST as postSubscriptionsPortal } from "../app/api/subscriptions/portal/route";
import { POST as postInvoicesSync } from "../app/api/invoices/sync/route";
import { POST as postSendDailyReport } from "../app/api/reports/send-daily-report/route";
import { GET as getHealth } from "../app/api/health/route";
import { GET as getMapbox } from "../app/api/mapbox/route";

import { type StoredAbrechnungRecord } from "../services/AbrechnungDatabaseService";
import { TariffAndCopilotDatabaseService } from "../services/TariffAndCopilotDatabaseService";
import { createStore } from "../services/store/storeFactory";
import { SqlDoorsRepo } from "../services/store/sqlDoorsRepo";
import { SqlSalesRepo } from "../services/store/sqlSalesRepo";
import { createSessionToken, VF_SESSION_SECONDS } from "../services/sicherheit/SessionToken";
import { resetKontenFuerTests, upsertSessionAccountAsync } from "../services/sicherheit/SessionUserService";
import { Sitzungswachdienst } from "../services/sicherheit/Sitzungswachdienst";
import type { Permission } from "../types/permissions.types";

const TEST_UA = "Mozilla/5.0 Vitest/DeepDomainSuite";

async function createAuthCookie(input: {
  id: string;
  email: string;
  name: string;
  role: string;
  teamId?: string;
  permissions?: Permission[];
}): Promise<string> {
  await upsertSessionAccountAsync({
    id: input.id,
    email: input.email,
    name: input.name,
    role: input.role,
    teamId: input.teamId,
    permissions: input.permissions,
    sitzungsVersion: 1,
  });
  const reqDummy = new Request("http://localhost/", { headers: { "user-agent": TEST_UA } });
  const sitzung = await Sitzungswachdienst.erstelleSitzung(input.id, input.name, VF_SESSION_SECONDS, reqDummy);
  const token = createSessionToken({
    id: input.id,
    version: 1,
    sessionId: sitzung.id,
    tokenId: sitzung.aktivesTokenId,
  });
  return `vf_session=${encodeURIComponent(token)}`;
}

function makeReq(
  url: string,
  options: {
    method?: string;
    cookie?: string;
    body?: unknown;
    rawBody?: BodyInit;
    headers?: Record<string, string>;
  } = {},
): Request {
  const headers: Record<string, string> = {
    "user-agent": TEST_UA,
    ...(options.headers ?? {}),
  };
  if (options.cookie) {
    headers.cookie = options.cookie;
  }
  let body: BodyInit | undefined = options.rawBody;
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  return new Request(url, {
    method: options.method ?? "GET",
    headers,
    body,
  });
}

describe("Deep Domain API Routes Integration Suite (50+ Route Handlers)", () => {
  beforeEach(() => {
    Sitzungswachdienst.resetFuerTests();
    resetKontenFuerTests();
  });

  describe("1. Abrechnung Domain Routes (11 routes)", () => {
    it("enforces 401 unauthenticated, isolates user A vs user B billing records, handles FormData upload, bulk item actions, and _id fallback in patchItems", async () => {
      // Unauthenticated -> 401
      const unauthRes = await getAbrechnung(makeReq("http://localhost/api/abrechnung"));
      expect(unauthRes.status).toBe(401);
      const unauthUpload = await postAbrechnungUpload(
        makeReq("http://localhost/api/abrechnung/upload", { method: "POST" }),
      );
      expect(unauthUpload.status).toBe(401);

      const cookieA = await createAuthCookie({
        id: "advisor-a",
        email: "a@pycie.com",
        name: "Advisor A",
        role: "berater",
      });
      const cookieB = await createAuthCookie({
        id: "advisor-b",
        email: "b@pycie.com",
        name: "Advisor B",
        role: "berater",
      });
      const cookieAdmin = await createAuthCookie({
        id: "admin-1",
        email: "admin@pycie.com",
        name: "Admin",
        role: "admin",
        permissions: ["*"],
      });

      // Non-multipart upload -> 400
      const invalidUploadRes = await postAbrechnungUpload(
        makeReq("http://localhost/api/abrechnung/upload", {
          method: "POST",
          cookie: cookieA,
          rawBody: "not-multipart",
          headers: { "content-type": "text/plain" },
        }),
      );
      expect(invalidUploadRes.status).toBe(400);

      // Valid FormData upload for User A -> 200
      const formA = new FormData();
      formA.append("file", new File(["pdf-bytes"], "vodafone_05_2026.pdf", { type: "application/pdf" }));
      formA.append("month", "5");
      formA.append("year", "2026");
      formA.append("category", "vodafone");
      formA.append("totalAmountPdf", "425");

      const uploadReqA = makeReq("http://localhost/api/abrechnung/upload", {
        method: "POST",
        cookie: cookieA,
      });
      Object.defineProperty(uploadReqA, "formData", { value: async () => formA });
      const uploadResA = await postAbrechnungUpload(uploadReqA);
      expect(uploadResA.status).toBe(200);
      const uploadBodyA = await uploadResA.json();
      expect(uploadBodyA.success).toBe(true);
      expect(uploadBodyA.data.parsedItemCount).toBeGreaterThan(0);
      const recordAId: string = uploadBodyA.data._id;

      // Valid FormData upload for User B -> 200
      const formB = new FormData();
      formB.append("file", new File(["pdf-bytes-b"], "vodafone_06_2026.pdf", { type: "application/pdf" }));
      formB.append("month", "6");
      formB.append("year", "2026");
      formB.append("category", "vodafone");

      const uploadReqB = makeReq("http://localhost/api/abrechnung/upload", {
        method: "POST",
        cookie: cookieB,
      });
      Object.defineProperty(uploadReqB, "formData", { value: async () => formB });
      const uploadResB = await postAbrechnungUpload(uploadReqB);
      expect(uploadResB.status).toBe(200);

      // Cross-tenant isolation: Advisor A only sees their own billing record (month 5), NOT Advisor B's (month 6)
      const listResA = await getAbrechnung(makeReq("http://localhost/api/abrechnung", { cookie: cookieA }));
      expect(listResA.status).toBe(200);
      const listDataA = (await listResA.json()).data;
      expect(listDataA).toHaveLength(1);
      expect(listDataA[0].month).toBe(5);

      // Admin sees all billing records
      const listResAdmin = await getAbrechnung(makeReq("http://localhost/api/abrechnung", { cookie: cookieAdmin }));
      expect(listResAdmin.status).toBe(200);
      expect((await listResAdmin.json()).data).toHaveLength(2);

      // GET /api/abrechnung/[id]/[year]
      const monthRes = await getAbrechnungMonth(
        makeReq("http://localhost/api/abrechnung/5/2026?category=vodafone", { cookie: cookieA }),
        { params: Promise.resolve({ id: "5", year: "2026" }) },
      );
      expect(monthRes.status).toBe(200);
      const monthData = (await monthRes.json()).data;
      expect(monthData._id).toBe(recordAId);

      // GET /api/abrechnung/unresolved/all
      const unresolvedRes = await getAbrechnungUnresolvedAll(
        makeReq("http://localhost/api/abrechnung/unresolved/all?category=vodafone", { cookie: cookieA }),
      );
      expect(unresolvedRes.status).toBe(200);
      const unresolvedItems = (await unresolvedRes.json()).data;
      expect(Array.isArray(unresolvedItems)).toBe(true);
      expect(unresolvedItems.length).toBeGreaterThan(0);

      // POST /api/abrechnung/[id]/compare
      const compareRes = await postAbrechnungCompare(
        makeReq(`http://localhost/api/abrechnung/${recordAId}/compare`, { method: "POST", cookie: cookieA }),
        { params: Promise.resolve({ id: recordAId }) },
      );
      expect(compareRes.status).toBe(200);
      expect((await compareRes.json()).data.compared).toBe(true);

      // Test _id fallback in patchItems when store record `id` differs from `_id`
      const store = createStore<StoredAbrechnungRecord>("abrechnungen");
      const rawStored = await store.get(recordAId);
      expect(rawStored).not.toBeNull();
      await store.removeWhere((r) => r.id === recordAId);
      const firstItem = { ...rawStored!.items[0]!, status: "missing_in_system" as const };
      const altRecord: StoredAbrechnungRecord = {
        ...rawStored!,
        id: "internal-store-key-999",
        _id: "public-alt-id-777",
        items: [firstItem, ...rawStored!.items.slice(1)],
      };
      await store.upsert(altRecord);

      const missingInSysItem = altRecord.items[0]!;
      const confirmRes = await postAbrechnungConfirmBulk(
        makeReq("http://localhost/api/abrechnung/public-alt-id-777/items/confirm/bulk", {
          method: "POST",
          cookie: cookieA,
          body: { itemIds: [missingInSysItem._id] },
        }),
        { params: Promise.resolve({ id: "public-alt-id-777" }) },
      );
      expect(confirmRes.status).toBe(200);
      const confirmedRecord = (await confirmRes.json()).data.record;
      expect(confirmedRecord).not.toBeNull();
      const confirmedItem = confirmedRecord.items.find((i: { _id: string }) => i._id === missingInSysItem._id);
      expect(confirmedItem.status).toBe("matched");

      // POST /api/abrechnung/[id]/reklamation/bulk (using _id fallback as well)
      const reklTargetItem = confirmedRecord.items[0]!;
      const reklRes = await postAbrechnungReklamationBulk(
        makeReq("http://localhost/api/abrechnung/public-alt-id-777/reklamation/bulk", {
          method: "POST",
          cookie: cookieA,
          body: { itemIds: [reklTargetItem._id], reason: "Falsche Provision", note: "Bitte prüfen" },
        }),
        { params: Promise.resolve({ id: "public-alt-id-777" }) },
      );
      expect(reklRes.status).toBe(200);
      const reklRecord = (await reklRes.json()).data.record;
      expect(reklRecord.items.find((i: { _id: string }) => i._id === reklTargetItem._id).reklamiert).toBe(true);

      // GET /api/abrechnung/reklamationen/all
      const allReklRes = await getAbrechnungReklamationenAll(
        makeReq("http://localhost/api/abrechnung/reklamationen/all?category=vodafone", { cookie: cookieA }),
      );
      expect(allReklRes.status).toBe(200);
      const allReklData = (await allReklRes.json()).data;
      expect(allReklData.some((i: { _id: string }) => i._id === reklTargetItem._id)).toBe(true);

      // POST /api/abrechnung/reklamationen/resolve/bulk
      const resolveBulkRes = await postAbrechnungReklamationenResolveBulk(
        makeReq("http://localhost/api/abrechnung/reklamationen/resolve/bulk", {
          method: "POST",
          cookie: cookieA,
          body: { itemIds: [reklTargetItem._id] },
        }),
      );
      expect(resolveBulkRes.status).toBe(200);
      expect((await resolveBulkRes.json()).data.updated).toBe(1);

      // POST /api/abrechnung/[id]/items/delete/bulk
      const beforeCount = reklRecord.items.length;
      const delItemsRes = await postAbrechnungDeleteBulk(
        makeReq("http://localhost/api/abrechnung/public-alt-id-777/items/delete/bulk", {
          method: "POST",
          cookie: cookieA,
          body: { itemIds: [reklTargetItem._id] },
        }),
        { params: Promise.resolve({ id: "public-alt-id-777" }) },
      );
      expect(delItemsRes.status).toBe(200);
      expect((await delItemsRes.json()).data.record.items).toHaveLength(beforeCount - 1);

      // DELETE /api/abrechnung/[id]
      const delRecRes = await deleteAbrechnung(
        makeReq("http://localhost/api/abrechnung/public-alt-id-777", { method: "DELETE", cookie: cookieA }),
        { params: Promise.resolve({ id: "public-alt-id-777" }) },
      );
      expect(delRecRes.status).toBe(200);
      expect((await delRecRes.json()).data.deleted).toBe(true);
    });
  });

  describe("2. Doors, Houses, Areas, Addresses, Visits & Streets (12 routes)", () => {
    it("prevents userId spoofing on bulk doors/houses, isolates advisor vs admin doors, and covers all door/area/street/visit routes", async () => {
      // Unauthenticated GET /api/houses -> 401
      const unauthHouses = await getHouses(makeReq("http://localhost/api/houses"));
      expect(unauthHouses.status).toBe(401);

      const cookieAdvisorA = await createAuthCookie({
        id: "adv-a",
        email: "adv-a@pycie.com",
        name: "Advisor A",
        role: "berater",
        teamId: "team-1",
      });
      const cookieAdvisorB = await createAuthCookie({
        id: "adv-b",
        email: "adv-b@pycie.com",
        name: "Advisor B",
        role: "berater",
        teamId: "team-2",
      });
      const cookieAdmin = await createAuthCookie({
        id: "admin-1",
        email: "admin@pycie.com",
        name: "Chief Admin",
        role: "admin",
        permissions: ["*"],
      });

      // Advisor A tries to spoof raw.userId = "adv-b" in POST /api/houses/bulk and POST /api/doors/bulk
      const housesBulkRes = await postHousesBulk(
        makeReq("http://localhost/api/houses/bulk", {
          method: "POST",
          cookie: cookieAdvisorA,
          body: {
            houses: [
              {
                id: "door-spoof-1",
                userId: "adv-b",
                street: "Königsallee",
                houseNumber: "10",
                city: "Düsseldorf",
                status: "OPEN",
              },
            ],
          },
        }),
      );
      expect(housesBulkRes.status).toBe(200);
      expect((await housesBulkRes.json()).data.synced).toBe(1);

      const doorsBulkRes = await postDoorsBulk(
        makeReq("http://localhost/api/doors/bulk", {
          method: "POST",
          cookie: cookieAdvisorA,
          body: {
            doors: [
              {
                id: "door-spoof-2",
                userId: "adv-b",
                street: "Schadowstraße",
                houseNumber: "22",
                city: "Düsseldorf",
                status: "VISITED",
                pendingDeletion: true,
              },
            ],
          },
        }),
      );
      expect(doorsBulkRes.status).toBe(200);

      // Verify in repository that both doors are owned by "adv-a", NOT "adv-b"!
      const storedDoor1 = await SqlDoorsRepo.getById("door-spoof-1");
      const storedDoor2 = await SqlDoorsRepo.getById("door-spoof-2");
      expect(storedDoor1?.userId).toBe("adv-a");
      expect(storedDoor2?.userId).toBe("adv-a");

      // Admin uploads a door for adv-b (admin CAN set custom owner)
      await postDoorsBulk(
        makeReq("http://localhost/api/doors/bulk", {
          method: "POST",
          cookie: cookieAdmin,
          body: {
            doors: [
              {
                id: "door-b-1",
                userId: "adv-b",
                teamId: "team-2",
                street: "Rheinstraße",
                houseNumber: "5",
                city: "Köln",
                status: "OPEN",
              },
            ],
          },
        }),
      );
      expect((await SqlDoorsRepo.getById("door-b-1"))?.userId).toBe("adv-b");

      // GET /api/houses: Advisor A sees only their non-pending-deletion doors (door-spoof-1)
      const housesResA = await getHouses(makeReq("http://localhost/api/houses", { cookie: cookieAdvisorA }));
      expect(housesResA.status).toBe(200);
      const housesA = (await housesResA.json()).data.houses;
      expect(housesA.map((h: { id: string }) => h.id)).toEqual(["door-spoof-1"]);

      // GET /api/houses: Admin sees all non-pending-deletion doors (door-spoof-1 + door-b-1)
      const housesResAdmin = await getHouses(makeReq("http://localhost/api/houses", { cookie: cookieAdmin }));
      expect(housesResAdmin.status).toBe(200);
      const housesAdmin = (await housesResAdmin.json()).data.houses;
      expect(housesAdmin.map((h: { id: string }) => h.id).sort()).toEqual(["door-b-1", "door-spoof-1"]);

      // GET /api/doors/points
      const pointsRes = await getDoorsPoints(makeReq("http://localhost/api/doors/points", { cookie: cookieAdvisorB }));
      expect(pointsRes.status).toBe(200);
      expect((await pointsRes.json()).data.points.map((p: { id: string }) => p.id)).toEqual(["door-b-1"]);

      // GET /api/doors/team/[id]
      const teamDoorsRes = await getDoorsTeam(
        makeReq("http://localhost/api/doors/team/team-2", { cookie: cookieAdvisorB }),
        { params: Promise.resolve({ id: "team-2" }) },
      );
      expect(teamDoorsRes.status).toBe(200);
      expect((await teamDoorsRes.json()).data.doors.map((d: { id: string }) => d.id)).toEqual(["door-b-1"]);

      // GET /api/doors/admin/all
      const adminAllDoorsRes = await getDoorsAdminAll(
        makeReq("http://localhost/api/doors/admin/all", { cookie: cookieAdmin }),
      );
      expect(adminAllDoorsRes.status).toBe(200);
      expect((await adminAllDoorsRes.json()).data.doors).toHaveLength(2);

      // GET /api/doors/admin/pending-deletions (door-spoof-2 has pendingDeletion: true)
      const pendingRes = await getDoorsPendingDeletions(
        makeReq("http://localhost/api/doors/admin/pending-deletions", { cookie: cookieAdmin }),
      );
      expect(pendingRes.status).toBe(200);
      const pendingList = (await pendingRes.json()).data.doors;
      expect(pendingList.map((d: { id: string }) => d.id)).toEqual(["door-spoof-2"]);

      // PATCH /api/doors/admin/[id]/resolve-deletion (reject -> keeps door & clears pendingDeletion)
      const rejectDelRes = await patchDoorResolveDeletion(
        makeReq("http://localhost/api/doors/admin/door-spoof-2/resolve-deletion", {
          method: "PATCH",
          cookie: cookieAdmin,
          body: { action: "reject" },
        }),
        { params: Promise.resolve({ id: "door-spoof-2" }) },
      );
      expect(rejectDelRes.status).toBe(200);
      expect((await rejectDelRes.json()).data.resolved).toBe(true);
      expect((await SqlDoorsRepo.getById("door-spoof-2"))?.details?.pendingDeletion).toBe(false);

      // PUT /api/doors/[id]
      const putDoorRes = await putDoor(
        makeReq("http://localhost/api/doors/door-spoof-1", {
          method: "PUT",
          cookie: cookieAdvisorA,
          body: { status: "SOLD", comment: "Glasfaser abgeschlossen" },
        }),
        { params: Promise.resolve({ id: "door-spoof-1" }) },
      );
      expect(putDoorRes.status).toBe(200);
      expect((await putDoorRes.json()).data.status).toBe("SOLD");

      // POST /api/street-assignments (assigns Königsallee in Düsseldorf to adv-b)
      const assignStreetRes = await postStreetAssignments(
        makeReq("http://localhost/api/street-assignments", {
          method: "POST",
          cookie: cookieAdmin,
          body: { userId: "adv-b", street: "Königsallee", zipCode: "40212", city: "Düsseldorf" },
        }),
      );
      expect(assignStreetRes.status).toBe(200);
      expect((await assignStreetRes.json()).data.updatedCount).toBe(1);
      expect((await SqlDoorsRepo.getById("door-spoof-1"))?.userId).toBe("adv-b");

      // DELETE /api/doors/[id]
      const delDoorRes = await deleteDoor(
        makeReq("http://localhost/api/doors/door-spoof-2", { method: "DELETE", cookie: cookieAdvisorA }),
        { params: Promise.resolve({ id: "door-spoof-2" }) },
      );
      expect(delDoorRes.status).toBe(200);
      expect(await SqlDoorsRepo.getById("door-spoof-2")).toBeNull();

      // GET & POST /api/areas and PUT /api/areas/[id]
      const postAreaRes = await postAreas(
        makeReq("http://localhost/api/areas", {
          method: "POST",
          cookie: cookieAdmin,
          body: {
            name: "Revier Nord",
            description: "Testgebiet",
            geojson: { type: "Polygon", coordinates: [[[6.77, 51.22], [6.78, 51.22], [6.77, 51.22]]] },
          },
        }),
      );
      expect(postAreaRes.status).toBe(201);
      const createdArea = (await postAreaRes.json()).data;
      expect(createdArea.name).toBe("Revier Nord");

      const putAreaRes = await putArea(
        makeReq(`http://localhost/api/areas/${createdArea.id}`, {
          method: "PUT",
          cookie: cookieAdmin,
          body: { name: "Revier Nord Updated" },
        }),
        { params: Promise.resolve({ id: createdArea.id }) },
      );
      expect(putAreaRes.status).toBe(200);
      expect((await putAreaRes.json()).data.name).toBe("Revier Nord Updated");

      const getAreasRes = await getAreas(makeReq("http://localhost/api/areas", { cookie: cookieAdmin }));
      expect(getAreasRes.status).toBe(200);
      expect((await getAreasRes.json()).data).toHaveLength(1);

      // POST /api/addresses/bulk, POST /api/visits/bulk, GET /api/location-tracking/team/[id]/current
      const addrRes = await postAddressesBulk(
        makeReq("http://localhost/api/addresses/bulk", { method: "POST", cookie: cookieAdvisorA, body: {} }),
      );
      expect(addrRes.status).toBe(200);
      expect((await addrRes.json()).data.synced).toBe(true);

      const visitsRes = await postVisitsBulk(
        makeReq("http://localhost/api/visits/bulk", { method: "POST", cookie: cookieAdvisorA, body: {} }),
      );
      expect(visitsRes.status).toBe(200);
      expect((await visitsRes.json()).data.synced).toBe(true);

      const locRes = await getLocationTrackingTeamCurrent(
        makeReq("http://localhost/api/location-tracking/team/team-1/current", { cookie: cookieAdvisorA }),
      );
      expect(locRes.status).toBe(200);
      expect(Array.isArray((await locRes.json()).data)).toBe(true);
    });
  });

  describe("3. Products, Sales, Teamleiter & Strukturleiter (13 routes)", () => {
    it("prevents userId spoofing on POST /api/products/bulk, isolates advisor sales, updates userId on assign-advisor, and covers all sales/teamleiter/strukturleiter routes", async () => {
      // Unauthenticated GET /api/products/sales -> 401
      const unauthSales = await getProductsSales(makeReq("http://localhost/api/products/sales"));
      expect(unauthSales.status).toBe(401);

      const cookieAdvisorA = await createAuthCookie({
        id: "adv-a",
        email: "adv-a@pycie.com",
        name: "Advisor A",
        role: "berater",
        teamId: "team-1",
      });
      const cookieAdvisorB = await createAuthCookie({
        id: "adv-b",
        email: "adv-b@pycie.com",
        name: "Advisor B",
        role: "berater",
        teamId: "team-2",
      });
      const cookieAdmin = await createAuthCookie({
        id: "admin-1",
        email: "admin@pycie.com",
        name: "Admin",
        role: "admin",
        permissions: ["*"],
      });

      // Advisor A attempts to spoof raw.userId = "adv-b" on POST /api/products/bulk
      const bulkResA = await postProductsBulk(
        makeReq("http://localhost/api/products/bulk", {
          method: "POST",
          cookie: cookieAdvisorA,
          body: {
            products: [
              {
                id: "sale-spoof-1",
                userId: "adv-b",
                productName: "GigaZuhause 250 Kabel",
                commissionEuro: 120,
                status: "pending",
              },
            ],
          },
        }),
      );
      expect(bulkResA.status).toBe(200);
      expect((await SqlSalesRepo.getById("sale-spoof-1"))?.userId).toBe("adv-a");

      // Admin creates a sale for adv-b
      await postProductsBulk(
        makeReq("http://localhost/api/products/bulk", {
          method: "POST",
          cookie: cookieAdmin,
          body: {
            products: [
              {
                id: "sale-b-1",
                userId: "adv-b",
                teamId: "team-2",
                productName: "Red Internet 100",
                commissionEuro: 85,
                status: "pending",
              },
            ],
          },
        }),
      );

      // GET /api/products/sales (Advisor A sees only own sale)
      const salesResA = await getProductsSales(
        makeReq("http://localhost/api/products/sales", { cookie: cookieAdvisorA }),
      );
      expect(salesResA.status).toBe(200);
      const salesListA = (await salesResA.json()).data.sales;
      expect(salesListA.map((s: { id: string }) => s.id)).toEqual(["sale-spoof-1"]);

      // PATCH /api/products/sales/[id]/status
      const statusRes = await patchProductsSalesStatus(
        makeReq("http://localhost/api/products/sales/sale-spoof-1/status", {
          method: "PATCH",
          cookie: cookieAdvisorA,
          body: { status: "completed" },
        }),
        { params: Promise.resolve({ id: "sale-spoof-1" }) },
      );
      expect(statusRes.status).toBe(200);
      expect((await statusRes.json()).data.status).toBe("completed");

      // PATCH /api/products/[id]/battle-exclude
      const excludeRes = await patchProductBattleExclude(
        makeReq("http://localhost/api/products/sale-spoof-1/battle-exclude", {
          method: "PATCH",
          cookie: cookieAdmin,
          body: { excluded: true },
        }),
        { params: Promise.resolve({ id: "sale-spoof-1" }) },
      );
      expect(excludeRes.status).toBe(200);
      expect((await excludeRes.json()).data.customerData.excludedFromBattle).toBe(true);

      // GET /api/products/team/[id]
      const teamProdRes = await getProductsTeam(
        makeReq("http://localhost/api/products/team/team-2", { cookie: cookieAdvisorB }),
        { params: Promise.resolve({ id: "team-2" }) },
      );
      expect(teamProdRes.status).toBe(200);
      expect((await teamProdRes.json()).data.products.map((p: { id: string }) => p.id)).toEqual(["sale-b-1"]);

      // GET /api/products/admin/all
      const adminAllProdRes = await getProductsAdminAll(
        makeReq("http://localhost/api/products/admin/all", { cookie: cookieAdmin }),
      );
      expect(adminAllProdRes.status).toBe(200);
      expect((await adminAllProdRes.json()).data.products).toHaveLength(2);

      // GET /api/products/admin/expiring & PATCH /api/products/[id]/assign-advisor
      const expRes = await getProductsAdminExpiring(
        makeReq("http://localhost/api/products/admin/expiring", { cookie: cookieAdmin }),
      );
      expect(expRes.status).toBe(200);
      const contracts = (await expRes.json()).data.contracts;
      expect(contracts.length).toBeGreaterThan(0);

      // Verify PATCH /api/products/[id]/assign-advisor updates advisor assignment in expiringStore AND/OR SqlSalesRepo
      const assignRes = await patchProductAssignAdvisor(
        makeReq(`http://localhost/api/products/${contracts[0].id}/assign-advisor`, {
          method: "PATCH",
          cookie: cookieAdmin,
          body: { advisorId: "adv-b" },
        }),
        { params: Promise.resolve({ id: contracts[0].id }) },
      );
      expect(assignRes.status).toBe(200);
      const assignData = (await assignRes.json()).data;
      expect(assignData.assignedAdvisorId).toBe("adv-b");

      // Also test assigning advisor on a sale in SqlSalesRepo (`sale-spoof-1`) so `userId` updates in repo!
      const assignSaleRes = await patchProductAssignAdvisor(
        makeReq("http://localhost/api/products/sale-spoof-1/assign-advisor", {
          method: "PATCH",
          cookie: cookieAdmin,
          body: { advisorId: "adv-b" },
        }),
        { params: Promise.resolve({ id: "sale-spoof-1" }) },
      );
      expect(assignSaleRes.status).toBe(200);
      expect((await SqlSalesRepo.getById("sale-spoof-1"))?.userId).toBe("adv-b");

      // PATCH /api/teamleiter/sales/[id]/status
      const tlStatusRes = await patchTeamleiterSaleStatus(
        makeReq("http://localhost/api/teamleiter/sales/sale-b-1/status", {
          method: "PATCH",
          cookie: cookieAdmin,
          body: { status: "cancelled", reason: "Widerruf" },
        }),
        { params: Promise.resolve({ id: "sale-b-1" }) },
      );
      expect(tlStatusRes.status).toBe(200);
      expect((await tlStatusRes.json()).data.status).toBe("cancelled");

      // GET /api/strukturleiter/doors & GET /api/strukturleiter/products
      const slDoorsRes = await getStrukturleiterDoors(
        makeReq("http://localhost/api/strukturleiter/doors", { cookie: cookieAdmin }),
      );
      expect(slDoorsRes.status).toBe(200);
      expect(Array.isArray((await slDoorsRes.json()).data.doors)).toBe(true);

      const slProdRes = await getStrukturleiterProducts(
        makeReq("http://localhost/api/strukturleiter/products", { cookie: cookieAdmin }),
      );
      expect(slProdRes.status).toBe(200);
      expect((await slProdRes.json()).data.products).toHaveLength(2);

      // DELETE /api/teamleiter/sales/[id] & DELETE /api/products/[id]
      const delTlRes = await deleteTeamleiterSale(
        makeReq("http://localhost/api/teamleiter/sales/sale-b-1", { method: "DELETE", cookie: cookieAdmin }),
        { params: Promise.resolve({ id: "sale-b-1" }) },
      );
      expect(delTlRes.status).toBe(200);
      expect(await SqlSalesRepo.getById("sale-b-1")).toBeNull();

      const delProdRes = await deleteProduct(
        makeReq("http://localhost/api/products/sale-spoof-1", { method: "DELETE", cookie: cookieAdmin }),
        { params: Promise.resolve({ id: "sale-spoof-1" }) },
      );
      expect(delProdRes.status).toBe(200);
      expect(await SqlSalesRepo.getById("sale-spoof-1")).toBeNull();
    });
  });

  describe("4. Logbook, Challenges, Incentives, Copilot, Teams, Simulate, Tariffs, Settings, Subscriptions, Invoices, Reports, Health, Mapbox (20 routes)", () => {
    it("handles logbook CRUD and 409 optimistic locking conflicts", async () => {
      const cookie = await createAuthCookie({
        id: "driver-1",
        email: "driver@pycie.com",
        name: "Driver",
        role: "berater",
      });

      const getRes = await getLogbook(makeReq("http://localhost/api/logbook", { cookie }));
      expect(getRes.status).toBe(200);
      const initialView = (await getRes.json()).data;
      expect(initialView.profile.rev).toBe(0);

      // PUT /api/logbook/months/[month] (rev 0 -> 1)
      const validMonthPayload = {
        baseRev: 0,
        trips: [
          {
            id: "trip-1",
            date: "2026-05-10",
            startTime: "09:00",
            endTime: "10:15",
            startKm: 12000,
            endKm: 12045,
            kind: "business",
            from: "Düsseldorf",
            to: "Köln",
            purpose: "Kundenbesuch",
            partner: "Müller",
            detour: "",
            vehicleId: "v-default",
            driver: "Driver",
            source: "manual",
            createdAt: "2026-05-10T09:00:00.000Z",
            revisions: [],
          },
        ],
        lock: null,
      };

      const putMonth1 = await putLogbookMonth(
        makeReq("http://localhost/api/logbook/months/2026-05", {
          method: "PUT",
          cookie,
          body: validMonthPayload,
        }),
        { params: Promise.resolve({ month: "2026-05" }) },
      );
      expect(putMonth1.status).toBe(200);
      expect((await putMonth1.json()).data.rev).toBe(1);

      // Optimistic locking conflict: sending baseRev: 0 again when stored rev is 1 -> 409!
      const conflictMonthRes = await putLogbookMonth(
        makeReq("http://localhost/api/logbook/months/2026-05", {
          method: "PUT",
          cookie,
          body: validMonthPayload,
        }),
        { params: Promise.resolve({ month: "2026-05" }) },
      );
      expect(conflictMonthRes.status).toBe(409);
      const conflictBody = await conflictMonthRes.json();
      expect(conflictBody.success).toBe(false);

      // PUT /api/logbook/profile (rev 0 -> 1, then conflict with baseRev: 0 -> 409)
      const profilePayload = {
        baseRev: 0,
        vehicles: [{ id: "v-1", name: "BMW 320d", plate: "D-VF 2026" }],
        activeVehicleId: "v-1",
        importedV1: true,
      };
      const putProfRes = await putLogbookProfile(
        makeReq("http://localhost/api/logbook/profile", {
          method: "PUT",
          cookie,
          body: profilePayload,
        }),
      );
      expect(putProfRes.status).toBe(200);
      expect((await putProfRes.json()).data.rev).toBe(1);

      const conflictProfRes = await putLogbookProfile(
        makeReq("http://localhost/api/logbook/profile", {
          method: "PUT",
          cookie,
          body: profilePayload,
        }),
      );
      expect(conflictProfRes.status).toBe(409);
    });

    it("covers Challenges & Incentives CRUD routes", async () => {
      const cookie = await createAuthCookie({
        id: "admin-1",
        email: "admin@pycie.com",
        name: "Admin",
        role: "admin",
        permissions: ["*"],
      });

      // GET /api/challenges
      const snapRes = await getChallenges(makeReq("http://localhost/api/challenges", { cookie }), {
        params: Promise.resolve({ slug: [] }),
      });
      expect(snapRes.status).toBe(200);

      // POST /api/challenges (create challenge)
      const createRes = await postChallenges(
        makeReq("http://localhost/api/challenges", {
          method: "POST",
          cookie,
          body: { opponentId: "adv-2" },
        }),
        { params: Promise.resolve({ slug: [] }) },
      );
      expect(createRes.status).toBe(201);
      const createdChallenge = (await createRes.json()).data;

      // PATCH /api/challenges/[id]/respond
      const respondRes = await patchChallenges(
        makeReq(`http://localhost/api/challenges/${createdChallenge.id}/respond`, {
          method: "PATCH",
          cookie,
          body: { action: "accept" },
        }),
        { params: Promise.resolve({ slug: [createdChallenge.id, "respond"] }) },
      );
      expect(respondRes.status).toBe(200);
      expect((await respondRes.json()).data.challenge.status).toBe("active");

      // PUT /api/challenges/point-config
      const putPointsRes = await putChallenges(
        makeReq("http://localhost/api/challenges/point-config", {
          method: "PUT",
          cookie,
          body: { vertical: "telco", points: { door: 1, lead: 5, sale: 25 } },
        }),
        { params: Promise.resolve({ slug: ["point-config"] }) },
      );
      expect(putPointsRes.status).toBe(200);

      // DELETE /api/challenges/[id]/cancel
      const cancelRes = await deleteChallenges(
        makeReq(`http://localhost/api/challenges/${createdChallenge.id}/cancel`, {
          method: "DELETE",
          cookie,
        }),
        { params: Promise.resolve({ slug: [createdChallenge.id, "cancel"] }) },
      );
      expect(cancelRes.status).toBe(200);
      expect((await cancelRes.json()).data.cancelled).toBe(true);

      // GET/POST /api/incentives & PUT/DELETE /api/incentives/[id]
      const listIncRes = await getIncentives(makeReq("http://localhost/api/incentives", { cookie }));
      expect(listIncRes.status).toBe(200);
      expect(Array.isArray((await listIncRes.json()).data)).toBe(true);

      const postIncRes = await postIncentives(
        makeReq("http://localhost/api/incentives", {
          method: "POST",
          cookie,
          body: { title: "Sommer Sprint", reward: "iPad Pro" },
        }),
      );
      expect(postIncRes.status).toBe(201);
      const createdContest = (await postIncRes.json()).data;

      const putIncRes = await putIncentive(
        makeReq(`http://localhost/api/incentives/${createdContest.id}`, {
          method: "PUT",
          cookie,
          body: { title: "Sommer Sprint Finale" },
        }),
        { params: Promise.resolve({ id: createdContest.id }) },
      );
      expect(putIncRes.status).toBe(200);
      expect((await putIncRes.json()).data.title).toBe("Sommer Sprint Finale");

      const delIncRes = await deleteIncentive(
        makeReq(`http://localhost/api/incentives/${createdContest.id}`, {
          method: "DELETE",
          cookie,
        }),
        { params: Promise.resolve({ id: createdContest.id }) },
      );
      expect(delIncRes.status).toBe(200);
      expect((await delIncRes.json()).data.deleted).toBe(true);
    });

    it("covers Copilot routes including SSE streaming on POST /api/copilot/chat and chat-stream", async () => {
      const cookie = await createAuthCookie({
        id: "adv-copilot",
        email: "copilot@pycie.com",
        name: "Copilot Tester",
        role: "berater",
      });

      await TariffAndCopilotDatabaseService.addMemory("adv-copilot", "fact", "10 Abschlüsse pro Woche", "user");

      // GET /api/copilot/memory
      const memRes = await getCopilot(makeReq("http://localhost/api/copilot/memory", { cookie }), {
        params: Promise.resolve({ slug: ["memory"] }),
      });
      expect(memRes.status).toBe(200);
      const memories = (await memRes.json()).data;
      expect(memories).toHaveLength(1);

      // POST /api/copilot/chat-stream (SSE stream reading)
      const streamRes = await postCopilot(
        makeReq("http://localhost/api/copilot/chat-stream", {
          method: "POST",
          cookie,
          body: { message: "Wie behandle ich den Einwand zu teuer?" },
        }),
        { params: Promise.resolve({ slug: ["chat-stream"] }) },
      );
      expect(streamRes.status).toBe(200);
      expect(streamRes.headers.get("content-type")).toContain("text/event-stream");
      const streamText = await streamRes.text();
      expect(streamText).toContain("data: ");
      expect(streamText).toContain('"type":"done"');

      // Also verify POST /api/copilot/chat works (either JSON or SSE stream when requested)
      const chatRes = await postCopilot(
        makeReq("http://localhost/api/copilot/chat", {
          method: "POST",
          cookie,
          headers: { accept: "text/event-stream" },
          body: { message: "Einwandbehandlung an der Haustür" },
        }),
        { params: Promise.resolve({ slug: ["chat"] }) },
      );
      expect(chatRes.status).toBe(200);
      const chatRaw = await chatRes.text();
      expect(chatRaw.length).toBeGreaterThan(10);

      // DELETE /api/copilot/memory/[id] & DELETE /api/copilot/memory
      const delOneRes = await deleteCopilot(
        makeReq(`http://localhost/api/copilot/memory/${memories[0].id}`, {
          method: "DELETE",
          cookie,
        }),
        { params: Promise.resolve({ slug: ["memory", memories[0].id] }) },
      );
      expect(delOneRes.status).toBe(200);

      const delAllRes = await deleteCopilot(
        makeReq("http://localhost/api/copilot/memory", { method: "DELETE", cookie }),
        { params: Promise.resolve({ slug: ["memory"] }) },
      );
      expect(delAllRes.status).toBe(200);
    });

    it("covers Teams, Simulate, Tariffs, Settings, Subscriptions, Invoices, Reports, Health, and Mapbox SSRF protection", async () => {
      const cookie = await createAuthCookie({
        id: "tl-1",
        email: "tl@pycie.com",
        name: "Teamleiter",
        role: "teamleiter",
        teamId: "team-alpha",
      });

      // Teams routes
      const teamsRes = await getTeams(makeReq("http://localhost/api/teams", { cookie }));
      expect(teamsRes.status).toBe(200);
      expect((await teamsRes.json()).data.teams.length).toBeGreaterThan(0);

      const pubTeamsRes = await getTeamsPublicList(makeReq("http://localhost/api/teams/public/list"));
      expect(pubTeamsRes.status).toBe(200);
      expect(Array.isArray((await pubTeamsRes.json()).data)).toBe(true);

      const perfRes = await getTeamPerformanceHistory(
        makeReq("http://localhost/api/teams/team-alpha/performance-history?period=14&vertical=telco", { cookie }),
      );
      expect(perfRes.status).toBe(200);

      const licRes = await getMyTeamLicenses(makeReq("http://localhost/api/teams/my-team/licenses", { cookie }));
      expect(licRes.status).toBe(200);
      expect((await licRes.json()).data.teamId).toBe("team-alpha");

      const updLicRes = await postMyTeamLicensesUpdate(
        makeReq("http://localhost/api/teams/my-team/licenses/update", {
          method: "POST",
          cookie,
          body: { licenseCount: 15, emails: ["a@pycie.com", "b@pycie.com"] },
        }),
      );
      expect(updLicRes.status).toBe(200);
      expect((await updLicRes.json()).data.updated).toBe(true);

      const updRefRes = await postMyTeamLicensesUpdateReferred(
        makeReq("http://localhost/api/teams/my-team/licenses/update-referred", {
          method: "POST",
          cookie,
          body: { emails: ["partner@pycie.com"] },
        }),
      );
      expect(updRefRes.status).toBe(200);
      expect((await updRefRes.json()).data.updated).toBe(true);

      // Simulate & Tariffs routes
      const simRes = await postSimulateCommission(
        makeReq("http://localhost/api/simulate/commission", {
          method: "POST",
          body: {
            products: [
              { category: "telco", type: "Kabel", quantity: 0 },
              { category: "telco", type: "Kabel", quantity: -5 },
              { category: "telco", type: "Kabel", quantity: 3 },
            ],
          },
        }),
      );
      expect(simRes.status).toBe(200);
      const simData = (await simRes.json()).data;
      expect(simData.perProduct[0].commission).toBe(0);
      expect(simData.perProduct[1].commission).toBe(0);
      expect(simData.perProduct[2].commission).toBe(3 * 85);

      const groupedRes = await getSimulateTariffsGrouped(
        makeReq("http://localhost/api/simulate/tariffs-grouped", { cookie }),
      );
      expect(groupedRes.status).toBe(200);

      const tariffsRes = await getTariffs(makeReq("http://localhost/api/tariffs?category=strom"));
      expect(tariffsRes.status).toBe(200);
      expect(Array.isArray((await tariffsRes.json()).data)).toBe(true);

      // Settings, Subscriptions, Invoices, Reports, Health
      const getEmailRes = await getEmailNotifications(
        makeReq("http://localhost/api/settings/email-notifications", { cookie }),
      );
      expect(getEmailRes.status).toBe(200);
      expect((await getEmailRes.json()).data.settings.enabled).toBe(false);

      const postEmailRes = await postEmailNotifications(
        makeReq("http://localhost/api/settings/email-notifications", {
          method: "POST",
          cookie,
          body: { enabled: true, time: "20:15" },
        }),
      );
      expect(postEmailRes.status).toBe(200);
      expect((await postEmailRes.json()).data.settings).toEqual({ enabled: true, time: "20:15" });

      const subCurRes = await getSubscriptionsCurrent(
        makeReq("http://localhost/api/subscriptions/current", { cookie }),
      );
      expect(subCurRes.status).toBe(200);

      const subPortalRes = await postSubscriptionsPortal(
        makeReq("http://localhost/api/subscriptions/portal", {
          method: "POST",
          cookie,
          body: { returnUrl: "/profile" },
        }),
      );
      expect(subPortalRes.status).toBe(200);
      expect((await subPortalRes.json()).data.url).toBe("/profile");

      const invSyncRes = await postInvoicesSync(
        makeReq("http://localhost/api/invoices/sync", { method: "POST", cookie }),
      );
      expect(invSyncRes.status).toBe(200);
      expect(Array.isArray((await invSyncRes.json()).data)).toBe(true);

      const repRes = await postSendDailyReport(
        makeReq("http://localhost/api/reports/send-daily-report", { method: "POST", cookie }),
      );
      expect(repRes.status).toBe(200);
      expect((await repRes.json()).data.sent).toBe(true);

      const healthRes = await getHealth(makeReq("http://localhost/api/health"));
      expect(healthRes.status).toBe(200);
      expect((await healthRes.json()).data.status).toBe("ok");

      // Mapbox route: status check without URL -> 200, SSRF block on non-mapbox URL -> 400!
      const mapboxNoUrlRes = await getMapbox(makeReq("http://localhost/api/mapbox"));
      expect(mapboxNoUrlRes.status).toBe(200);
      expect((await mapboxNoUrlRes.json()).data.proxied).toBe(true);

      const mapboxSsrfRes = await getMapbox(
        makeReq("http://localhost/api/mapbox?url=https://evil.example.com/steal-metadata"),
      );
      expect(mapboxSsrfRes.status).toBe(400);

      const mapboxHttpRes = await getMapbox(
        makeReq("http://localhost/api/mapbox?url=http://api.mapbox.com/styles/v1"),
      );
      expect(mapboxHttpRes.status).toBe(400);
    });
  });
});
