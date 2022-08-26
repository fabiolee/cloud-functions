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

const getStock = async (
    code: string | string[] | qs.ParsedQs | qs.ParsedQs[]
): Promise<FirebaseFirestore.DocumentData> => {
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
    return result.docs[0].data();
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
        const doc = await getStock(code);
        response.json({doc});
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
        const doc = await getStock(code);
        doc.update({price: 9.10});
        response.json({doc});
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
        await getStock(code);
        onResponseFailure(response, "There is a record found!");
      } catch (error) {
        const newStock: StockData = {
          category: "Health Care Equipment & Services",
          code: "5168",
          countryCode: "MY",
          dy: 30.57,
          name: "Hartalega Holdings Berhad",
          pe: 5.64,
          price: 1.75,
          roe: 20.83,
          symbol: "HARTA",
          top: true,
        };
        const doc = await admin
            .firestore()
            .collection(DB_TABLE_NAME)
            .add(newStock);
        response.json({doc});
      }
    });
