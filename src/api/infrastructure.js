import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};
//building api
export const createBuilding = async (payload) => {
  return api.post(
    "/infrastructure/buildings/complete",
    payload,
    {
      headers: getHeaders(),
    }
  );
};

export const getBuildings = async () => {
  const { data } = await api.get(
    "/infrastructure/buildings",
    {
      headers: getHeaders(),
    }
  );
  return data;
};

export const getBuildingByUUID = async (buildingUUID) => {
  const { data } = await api.get(
    `/infrastructure/buildings/${buildingUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

export const updateBuilding = async (buildingUUID, payload) => {
  const { data } = await api.put(
    `/infrastructure/buildings/${buildingUUID}`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
// Delete Building
export const deleteBuilding = async (buildingUUID) => {
  const { data } = await api.delete(
    `/infrastructure/buildings/${buildingUUID}`,
    {
      headers: getHeaders(),
    }
  );
  return data;
};
//block api
export const createBlock = async (buildingUUID, payload) => {
  const { data } = await api.post(
    `/infrastructure/buildings/${buildingUUID}/blocks`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
export const getBlocks = async (buildingUUID) => {
  const { data } = await api.get(
    `/infrastructure/buildings/${buildingUUID}/blocks`,
    {
      headers: getHeaders(),
    }
  );
  return data;
};

// Get Block By UUID
export const getBlockByUUID = async (blockUUID) => {
  const { data } = await api.get(
    `/infrastructure/blocks/${blockUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

// Update Block
export const updateBlock = async (blockUUID, payload) => {
  const { data } = await api.put(
    `/infrastructure/blocks/${blockUUID}`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

// Delete Block
export const deleteBlock = async (blockUUID) => {
  const { data } = await api.delete(
    `/infrastructure/blocks/${blockUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
//fooler api
export const getFloors = async (blockUUID) => {
  const { data } = await api.get(
    `/infrastructure/blocks/${blockUUID}/floors`,
    {
      headers: getHeaders(),
    }
  );
  return data;
};

// Create Floor
export const createFloor = async (blockUUID, payload) => {
  const { data } = await api.post(
    `/infrastructure/blocks/${blockUUID}/floors`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
// Get Floor By UUID
export const getFloorByUUID = async (floorUUID) => {
  const { data } = await api.get(
    `/infrastructure/floors/${floorUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

// Update Floor
export const updateFloor = async (floorUUID, payload) => {
  const { data } = await api.put(
    `/infrastructure/floors/${floorUUID}`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

// Delete Floor
export const deleteFloor = async (floorUUID) => {
  const { data } = await api.delete(
    `/infrastructure/floors/${floorUUID}`,
    {
      headers: getHeaders(),
    }
  );
  return data;
};
//rooms api
export const getRooms = async (floorUUID) => {
  const { data } = await api.get(
    "/infrastructure/rooms",
    {
      params: {
        floor_uuid: floorUUID,
      },
      headers: getHeaders(),
    }
  );

  return data;
};
export const createRoom = async (payload) => {
  const { data } = await api.post(
    "/infrastructure/rooms",
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
export const getRoomByUUID = async (roomUUID) => {
  const { data } = await api.get(
    `/infrastructure/rooms/${roomUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
export const updateRoom = async (roomUUID, payload) => {
  const { data } = await api.put(
    `/infrastructure/rooms/${roomUUID}`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
export const deleteRoom = async (roomUUID) => {
  const { data } = await api.delete(
    `/infrastructure/rooms/${roomUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};