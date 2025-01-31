import { configurarDireccion } from "@/app/lib/utils";
import { GameObjects, Physics } from "phaser";
import {
  Direccion,
  Estado,
  Movimiento,
  Seat,
  Sprite,
} from "../types/Estudio.types";

export default class RandomWalkerNPC extends GameObjects.Sprite {
  private npc!: Physics.Arcade.Sprite;
  private seats: Seat[];
  private seatTaken: Seat | null;
  private seatsTaken: Seat[];
  private caminoIndice: number;
  private sitting: boolean;
  private idle: boolean;
  private currentPath: { x: number; y: number }[];
  private currentPathIndex: number;
  private velocidad: { x: number; y: number };
  camino: Estado[] = [];

  constructor(
    scene: Phaser.Scene,
    sprite: Sprite,
    seats: Seat[],
    seatsTaken: Seat[],
    caminoInicial: Estado[],
    cam: boolean
  ) {
    super(scene, sprite.x, sprite.y, sprite.etiqueta);
    this.scene.physics.world.enable(this);
    this.seats = seats;
    this.seatsTaken = seatsTaken;
    this.currentPathIndex = 0;
    this.caminoIndice = -1;
    this.velocidad = { x: 0, y: 0 };
    this.currentPath = [];
    this.seatTaken = null;
    this.sitting = false;
    this.idle = false;
    this.camino = caminoInicial;
    this.configureSprite(sprite, cam);
  }

  update() {
    if (this.npc && this.camino?.length > 0) {
      if (
        this.currentPath.length > 0 &&
        !this.sitting &&
        this.camino[this.caminoIndice]?.estado !== Movimiento.Idle &&
        this.currentPath.length !== 1
      ) {
        this.seguirCamino();
      } else if (
        this.caminoIndice < this.camino.length - 1 &&
        this.currentPath?.length < 1 &&
        !this.sitting
      ) {
        this.empezarProximoCamino();
      }

      this.encontrarDireccion();
      this.manejarProfundidad();
    }
  }

  private configureSprite(ops: Sprite, cam: boolean) {
    if (!this.npc) {
      this.npc = this.scene.physics.add
        .sprite(
          this.camino?.[0]?.puntos_de_camino?.[0]?.x,
          this.camino?.[0]?.puntos_de_camino?.[0]?.y,
          ops.etiqueta
        )
        .setScale(ops.escala.x, ops.escala.y)
        .setOrigin(0.5, 0.5)
        .setDepth(this.camino?.[0]?.puntos_de_camino?.[0]?.y);
      this.npc.body?.setSize(ops.anchura, ops.altura, true);
      this.configurarAnimaciones();

      cam && this.makeCameraFollow();
    }
  }

  private empezarProximoCamino() {
    if (this.sitting) return;
    this.caminoIndice++;
    const estado = this.camino[this.caminoIndice];
    this.currentPath = estado?.puntos_de_camino;
    this.currentPathIndex = 0;

    if (this.caminoIndice > 0) {
      this.camino.splice(0, this.caminoIndice);
      this.caminoIndice = 0;
    }

    switch (estado?.estado) {
      case Movimiento.Idle:
        this.goIdle();
        break;
      case Movimiento.Sit:
      case Movimiento.Move:
        const found = this.seats?.find(
          (seat) => seat.image.texture?.key == estado?.silla_aleatoria
        );
        if (found) {
          if (found?.par?.y) {
            found?.image.setDepth(found?.par?.y!);
          }
          this.seatTaken = null;
        }
        break;
    }
  }

  private goSit(randomSeat: string) {
    this.velocidad = { x: 0, y: 0 };
    const foundSeat = this.seats.find(
      (seat) => seat.image.texture?.key == randomSeat
    );

    if (foundSeat) {
      this.seatTaken = foundSeat;
      this.seatsTaken.push(foundSeat);
      this.npc.x = foundSeat?.x_adjustado;
      this.npc.y = foundSeat?.y_adjustado;
      this.updateDepth(foundSeat);
    }
  }

  private updateDepth(seat: Seat) {
    if (seat) {
      if (seat.profundidad && seat.par) {
        this.npc.setDepth(seat.par.depth + 1);
        seat.image.setDepth(this.npc.depth + 1);
      } else {
        this.npc.setDepth(this.npc.y);
        seat.image.setDepth(this.npc.y - 1);
      }
    } else {
      this.npc.setDepth(this.npc.y);
    }
  }

  private goIdle() {
    this.idle = true;
    this.velocidad = { x: 0, y: 0 };

    this.npc.anims.play(
      configurarDireccion(this.npc.texture.key, Direccion.Inactivo),
      true
    );
    this.scene.time.delayedCall(
      this.camino[this.caminoIndice]?.duracion!,
      () => {
        this.idle = false;
        this.empezarProximoCamino();
      },
      [],
      this
    );
  }

  private encontrarDireccion() {
    if (
      this.idle ||
      this.camino[this.caminoIndice]?.estado === Movimiento.Idle ||
      this.currentPath?.length === 1
    ) {
      this.npc.anims.play(
        configurarDireccion(this.npc.texture.key, Direccion.Inactivo),
        true
      );
      return;
    } else if (this.sitting) {
      this.npc.anims.play(
        configurarDireccion(this.npc.texture.key, this.seatTaken?.anim!),
        true
      );
      return;
    }

    const dx = this.velocidad?.x!;
    const dy = this.velocidad?.y!;

    const direccion = this.devolverDireccion(dx, dy);

    if (
      direccion &&
      direccion !== this.npc.anims.currentAnim?.key &&
      this.debeCambiarDireccion(direccion)
    ) {
      this.npc.anims.play(direccion, true);
    }
  }

  private debeCambiarDireccion(nuevaDireccion: string): boolean {
    const direcciones = [nuevaDireccion];

    if (this.currentPath?.length - this.currentPathIndex <= 6) {
      return true;
    }

    for (let i = 1; i <= 6; i++) {
      const proximoIndice = this.currentPathIndex + i;
      if (proximoIndice >= this.currentPath?.length) break;

      const point = this.currentPath[proximoIndice];
      const dx = point.x - this.npc.x;
      const dy = point.y - this.npc.y;
      const direccion = this.devolverDireccion(dx, dy);
      if (direccion) direcciones.push(direccion);
    }

    return direcciones.every((d) => d === nuevaDireccion);
  }

  private devolverDireccion(dx: number, dy: number): string | null {
    let angulo = Math.atan2(dy, dx) * (180 / Math.PI);
    let proximaDireccion: string | null = null;
    if (angulo < 0) angulo += 360;

    if (angulo >= 337.5 || angulo < 22.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.Derecha
      );
    } else if (angulo >= 22.5 && angulo < 67.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.DerechaAbajo
      );
    } else if (angulo >= 67.5 && angulo < 112.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.Abajo
      );
    } else if (angulo >= 112.5 && angulo < 157.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.IzquierdaAbajo
      );
    } else if (angulo >= 157.5 && angulo < 202.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.Izquierda
      );
    } else if (angulo >= 202.5 && angulo < 247.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.IzquierdaArriba
      );
    } else if (angulo >= 247.5 && angulo < 292.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.Arriba
      );
    } else if (angulo >= 292.5 && angulo < 337.5) {
      proximaDireccion = configurarDireccion(
        this.npc.texture.key,
        Direccion.DerechaArriba
      );
    }

    return proximaDireccion;
  }

  private seguirCamino() {
    if (this.caminoIndice >= this.camino?.length || this.sitting) return;

    if (
      this.currentPath?.length > 0 &&
      this.currentPathIndex < this.currentPath?.length &&
      !this.sitting
    ) {
      const point = this.currentPath[this.currentPathIndex];
      this.currentPathIndex++;

      const dx = point.x - this.npc.x;
      const dy = point.y - this.npc.y;
      const angulo = Math.atan2(dy, dx);
      this.velocidad = {
        x: Math.cos(angulo) * 60,
        y: Math.sin(angulo) * 60,
      };
      this.npc.x = point.x;
      this.npc.y = point.y;
      this.encontrarDireccion();
    } else if (
      this.currentPath?.length > 0 &&
      this.currentPathIndex == this.currentPath?.length
    ) {
      if (
        !this.sitting &&
        this.camino[this.caminoIndice]?.estado === Movimiento.Sit &&
        !this.seatsTaken.find(
          (seat) =>
            seat.etiqueta == this.camino[this.caminoIndice]?.silla_aleatoria
        ) &&
        this.seatTaken == null
      ) {
        this.sitting = true;
        this.goSit(this.camino[this.caminoIndice]?.silla_aleatoria!);

        this.npc.anims.play(
          configurarDireccion(this.npc.texture.key, this.seatTaken!?.anim!),
          true
        );
        this.scene.time.delayedCall(
          this.camino[this.caminoIndice]?.duracion!,
          () => {
            this.seatsTaken = this.seatsTaken.filter(
              (item) => item.etiqueta !== this.seatTaken?.etiqueta
            );

            this.seatTaken = null;
            this.sitting = false;
            this.npc.x =
              this.camino[this.caminoIndice]?.puntos_de_camino[
                this.camino[this.caminoIndice]?.puntos_de_camino?.length - 1
              ]?.x;
            this.npc.y =
              this.camino[this.caminoIndice]?.puntos_de_camino[
                this.camino[this.caminoIndice]?.puntos_de_camino?.length - 1
              ]?.y;

            this.empezarProximoCamino();
          },
          [],
          this
        );
      }
      this.currentPathIndex = 0;
      this.currentPath = [];
    }
  }

  private manejarProfundidad() {
    if (
      !this.seatTaken ||
      !this.seatTaken.profundidad ||
      this.seatTaken.anim == "sentadoSofa"
    ) {
      this.npc.setDepth(this.npc!.y);
    } else if (this.seatTaken) {
      this.updateDepth(this.seatTaken);
    }
  }
  private async configurarAnimaciones() {
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.Inactivo),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 132,
        end: 143,
      }),
      frameRate: 0.3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.Arriba),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 0,
        end: 11,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.Izquierda),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 24,
        end: 35,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.Abajo),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 12,
        end: 23,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.Derecha),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 36,
        end: 47,
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.IzquierdaAbajo),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 72,
        end: 83,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.IzquierdaArriba),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 48,
        end: 59,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.DerechaArriba),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 60,
        end: 71,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.DerechaAbajo),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 84,
        end: 95,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.Sofa),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 96,
        end: 107,
      }),
      frameRate: 0.3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: configurarDireccion(this.npc.texture.key, Direccion.Silla),
      frames: this.scene.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 108,
        end: 119,
      }),
      frameRate: 0.3,
      repeat: -1,
    });
  }
  makeCameraFollow() {
    this.scene.cameras.main.startFollow(this.npc, true, 0.05, 0.05);
  }
  stopCameraFollow() {
    this.scene.cameras.main.stopFollow();
  }
}
