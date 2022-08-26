import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const DB_TABLE_NAME = "stock";
const REGION = "asia-southeast1";

type StockData = {
  category: string;
  code: string;
  countryCode: string;
  dy: number;
  name: string;
  pe: number;
  price: number;
  roe: number;
  symbol: string;
  top: boolean;
}

const getStockDocSnapshot = async (
    code: string | string[] | qs.ParsedQs | qs.ParsedQs[]
): Promise<
  FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
> => {
  const result = await admin
      .firestore()
      .collection(DB_TABLE_NAME)
      .where("code", "==", code)
      .get();
  if (result.empty) {
    throw new Error("No record found!");
  } else if (result.size > 1) {
    throw new Error("More than 1 record found!");
  } else {
    return result.docs[0];
  }
};

const onResponseFailure = (response: functions.Response, message: string) =>
  response.json({error: message});

export const showStock = functions
    .region(REGION)
    .https.onRequest(async (request, response) => {
      const code = request.query.code;
      if (code === undefined) {
        onResponseFailure(response, "No query found!");
        return;
      }
      try {
        const docSnapshot = await getStockDocSnapshot(code);
        response.json({doc: docSnapshot.data()});
      } catch (error) {
        if (error instanceof Error) {
          onResponseFailure(response, error.message);
        } else {
          onResponseFailure(response, "Unknown error!");
        }
      }
    });

export const updateStock = functions
    .region(REGION)
    .https.onRequest(async (request, response) => {
      const code = request.query.code;
      if (code === undefined) {
        onResponseFailure(response, "No query found!");
        return;
      }
      try {
        const docSnapshot = await getStockDocSnapshot(code);
        const stock: Partial<StockData> = {
          price: 8.94,
          roe: 9.03,
          pe: 14.00,
          dy: 6.49,
          top: false,
        };
        const result = docSnapshot.ref.update(stock);
        response.json({result});
      } catch (error) {
        if (error instanceof Error) {
          onResponseFailure(response, error.message);
        } else {
          onResponseFailure(response, "Unknown error!");
        }
      }
    });

export const addStock = functions
    .region(REGION)
    .https.onRequest(async (request, response) => {
      const code = request.query.code;
      if (code === undefined) {
        onResponseFailure(response, "No query found!");
        return;
      }
      try {
        await getStockDocSnapshot(code);
        onResponseFailure(response, "There is a record found!");
      } catch (error) {
        const stock: StockData = {
          code: "5168",
          countryCode: "MY",
          symbol: "HARTA",
          name: "Hartalega Holdings Berhad",
          category: "Health Care Equipment & Services",
          price: 1.75,
          roe: 20.83,
          pe: 5.64,
          dy: 30.57,
          top: true,
        };
        const docRef = await admin
            .firestore()
            .collection(DB_TABLE_NAME)
            .add(stock);
        const docSnapshot = await docRef.get();
        response.json({doc: docSnapshot.data()});
      }
    });
