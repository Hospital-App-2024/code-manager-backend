import { Nodo, TypeDevice } from '@prisma/client';

export class DeviceEntity {
  public constructor(
    public id: string,
    public lazo: string,
    public location: string,
    public device: string,
    public nodoId: string,
    public typeDeviceId: string,
    public operative: boolean,
    public observations: null | string,
    public nodo: Nodo,
    public typeDevice: TypeDevice,
  ) {}

  public static fromPrisma(dto: DeviceEntity) {
    const device = new DeviceEntity(
      dto.id,
      dto.lazo,
      dto.location,
      dto.device,
      dto.nodoId,
      dto.typeDeviceId,
      dto.operative,
      dto.observations,
      dto.nodo,
      dto.typeDevice,
    );

    const { nodoId, typeDeviceId, ...rest } = device;

    return {
      ...rest,
      nodo: `${device.nodo.nodo} - ${device.nodo.building}`,
      typeDevice: device.typeDevice.type,
    };
  }

  public static mapFromArray(devices: DeviceEntity[]) {
    return devices.map((device) => DeviceEntity.fromPrisma(device));
  }
}
