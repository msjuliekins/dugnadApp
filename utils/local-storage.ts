import { DugnadData} from "@/types/dugnad";
import AsyncStorage from "@react-native-async-storage/async-storage";

  export async function storeData(key: string, value: string) {
    try {
        await AsyncStorage.setItem(key, value);
        console.log("Stored!");
    } catch (e) {
        console.log("Feil med storeData()" + e);
    }
  }

  export async function getData(key: string) {
    try {
        const data = await AsyncStorage.getItem(key);
        if (data !== null) {
            console.log(data);
            return data;
        }
    } catch (e) {
        console.log("Feil med storeData()" + e);
    }
  }

  export async function getDugnadByLocalId(id: string) {
    try {
        const data = await AsyncStorage.getItem("dugnadStore");
        if (data !== null) {
          const dugnads: DugnadData[] = JSON.parse(data);
          return dugnads.find(dugnad => dugnad.id === id);
        }
    } catch (e) {
      console.log("Feil med getDugnadByIdLocal()", e)
    }
  }
   
  export async function updateDugnadById(id: string, updateDugnad: DugnadData) {
    try {
      const data = await AsyncStorage.getItem("dugnadStore");
        if (data !== null) {
          const dugnads: DugnadData[] = JSON.parse(data);
          const updatedDugnads = dugnads.map(exisitingDugnad => exisitingDugnad.id === id ? updateDugnad : exisitingDugnad)
          await AsyncStorage.setItem("dugnadStore", JSON.stringify(updatedDugnads));
        }
    } catch (e) {
      console.log("Feil med updateDugnadByid()", e);
    }
  }