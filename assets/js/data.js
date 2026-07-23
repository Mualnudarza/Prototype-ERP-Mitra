/* ============================================================
   ERP Data Layer — Customer Management
   Menyimpan data pelanggan menggunakan localStorage sehingga
   prototype ini punya "database" yang persist di browser tanpa
   backend. Modul lain (Work Order, Billing, dsb) nantinya bisa
   membaca data yang sama lewat CustomerDB.
   ============================================================ */

(function (global) {
  const STORAGE_KEY = "erp_customers_v1";
  const ACTOR = "Admin Mitra"; // pengguna aktif prototype (dummy, belum ada modul auth)

  const PACKAGES = [
    "Home 10 Mbps",
    "Home 20 Mbps",
    "Home 50 Mbps",
    "Business 100 Mbps",
    "Business 200 Mbps",
  ];

  const STATUS = {
    ACTIVE: "Active",
    ISOLIR: "Isolir",
    TERMINATE: "Terminate",
  };

  function uid(prefix) {
    return (
      prefix +
      "-" +
      Date.now().toString(36).slice(-5) +
      Math.random().toString(36).slice(2, 6)
    ).toUpperCase();
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function seedData() {
    const today = new Date();
    const addDays = (d) => {
      const t = new Date(today);
      t.setDate(t.getDate() + d);
      return t.toISOString().slice(0, 10);
    };

    const seed = [
      {
        customer_name: "Budi Santoso",
        pppoe_secret: "budi.santoso@mitra",
        phone_number: "081234500011",
        subscribe_date: addDays(-420),
        expired_date: addDays(18),
        installation_address: "Jl. Diponegoro No. 12, Batu, Jawa Timur",
        package_name: "Home 20 Mbps",
        customer_status: STATUS.ACTIVE,
        modem_serial_number: "SN-ONT-88213",
        latitude: -7.8713,
        longitude: 112.5240,
        olt_port: "OLT-BTU-01/1/2",
        onu_number: "ONU-0231",
        access_name: "Access-Batu-Center",
        access_port: "AP-04",
      },
      {
        customer_name: "Siti Rahmawati",
        pppoe_secret: "siti.rahma@mitra",
        phone_number: "082199912233",
        subscribe_date: addDays(-260),
        expired_date: addDays(6),
        installation_address: "Jl. Ir. Soekarno No. 45, Malang, Jawa Timur",
        package_name: "Home 50 Mbps",
        customer_status: STATUS.ACTIVE,
        modem_serial_number: "SN-ONT-77410",
        latitude: -7.9316,
        longitude: 112.6100,
        olt_port: "OLT-MLG-02/1/4",
        onu_number: "ONU-0455",
        access_name: "Access-Malang-Utara",
        access_port: "AP-11",
      },
      {
        customer_name: "Agus Wijaya",
        pppoe_secret: "agus.wijaya@mitra",
        phone_number: "085711122334",
        subscribe_date: addDays(-90),
        expired_date: addDays(-3),
        installation_address: "Jl. Panglima Sudirman No. 8, Batu, Jawa Timur",
        package_name: "Business 100 Mbps",
        customer_status: STATUS.ISOLIR,
        modem_serial_number: "SN-ONT-91002",
        latitude: -7.8676,
        longitude: 112.5320,
        olt_port: "OLT-BTU-01/1/6",
        onu_number: "ONU-0902",
        access_name: "Access-Batu-Center",
        access_port: "AP-02",
      },
      {
        customer_name: "Dewi Lestari",
        pppoe_secret: "dewi.lestari@mitra",
        phone_number: "081345567788",
        subscribe_date: addDays(-540),
        expired_date: addDays(45),
        installation_address: "Jl. Ahmad Yani No. 21, Malang, Jawa Timur",
        package_name: "Home 10 Mbps",
        customer_status: STATUS.ACTIVE,
        modem_serial_number: "SN-ONT-66120",
        latitude: -7.9556,
        longitude: 112.6144,
        olt_port: "OLT-MLG-01/1/1",
        onu_number: "ONU-0110",
        access_name: "Access-Malang-Selatan",
        access_port: "AP-07",
      },
      {
        customer_name: "Rudi Hartono",
        pppoe_secret: "rudi.hartono@mitra",
        phone_number: "087788899900",
        subscribe_date: addDays(-700),
        expired_date: addDays(-120),
        installation_address: "Jl. Raya Pandaan No. 3, Pasuruan, Jawa Timur",
        package_name: "Home 20 Mbps",
        customer_status: STATUS.TERMINATE,
        modem_serial_number: "SN-ONT-50098",
        latitude: -7.6448,
        longitude: 112.6996,
        olt_port: "OLT-PSR-01/1/3",
        onu_number: "ONU-0710",
        access_name: "Access-Pasuruan",
        access_port: "AP-01",
      },
      {
        customer_name: "Ani Purwanti",
        pppoe_secret: "ani.purwanti@mitra",
        phone_number: "089911223344",
        subscribe_date: addDays(-30),
        expired_date: addDays(0),
        installation_address: "Jl. Kartini No. 9, Batu, Jawa Timur",
        package_name: "Home 50 Mbps",
        customer_status: STATUS.ACTIVE,
        modem_serial_number: "SN-ONT-40331",
        latitude: -7.8757,
        longitude: 112.5185,
        olt_port: "OLT-BTU-02/1/2",
        onu_number: "ONU-0321",
        access_name: "Access-Batu-Center",
        access_port: "AP-09",
      },
      {
        customer_name: "Joko Prasetyo",
        pppoe_secret: "joko.prasetyo@mitra",
        phone_number: "081277788899",
        subscribe_date: addDays(-15),
        expired_date: addDays(15),
        installation_address: "Jl. Sultan Agung No. 5, Malang, Jawa Timur",
        package_name: "Business 200 Mbps",
        customer_status: STATUS.ACTIVE,
        modem_serial_number: "SN-ONT-20087",
        latitude: -7.9797,
        longitude: 112.6304,
        olt_port: "OLT-MLG-03/1/8",
        onu_number: "ONU-0880",
        access_name: "Access-Malang-Utara",
        access_port: "AP-13",
      },
      {
        customer_name: "Nur Aini",
        pppoe_secret: "nur.aini@mitra",
        phone_number: "081611144477",
        subscribe_date: addDays(-200),
        expired_date: addDays(-30),
        installation_address: "Jl. Gajah Mada No. 17, Batu, Jawa Timur",
        package_name: "Home 20 Mbps",
        customer_status: STATUS.ISOLIR,
        modem_serial_number: "SN-ONT-33021",
        latitude: -7.8697,
        longitude: 112.5271,
        olt_port: "OLT-BTU-01/1/9",
        onu_number: "ONU-0602",
        access_name: "Access-Batu-Center",
        access_port: "AP-06",
      },
    ];

    return seed.map((c) => {
      const id = uid("CUST");
      return {
        id,
        ...c,
        package_history: [
          {
            package_name: c.package_name,
            changed_at: c.subscribe_date + "T00:00:00.000Z",
            note: "Paket awal saat registrasi",
          },
        ],
        address_history: [
          {
            address: c.installation_address,
            latitude: c.latitude,
            longitude: c.longitude,
            changed_at: c.subscribe_date + "T00:00:00.000Z",
            note: "Alamat pemasangan awal",
          },
        ],
        activity_log: [
          {
            timestamp: c.subscribe_date + "T00:00:00.000Z",
            action: "Registrasi",
            detail: `Pelanggan ${c.customer_name} didaftarkan dengan paket ${c.package_name}.`,
            actor: ACTOR,
          },
          ...(c.customer_status === STATUS.ISOLIR
            ? [
                {
                  timestamp: nowISO(),
                  action: "Suspend",
                  detail: "Layanan disuspend (Isolir) karena kendala administrasi.",
                  actor: ACTOR,
                },
              ]
            : []),
          ...(c.customer_status === STATUS.TERMINATE
            ? [
                {
                  timestamp: nowISO(),
                  action: "Terminate",
                  detail: "Layanan dihentikan permanen atas permintaan pelanggan.",
                  actor: ACTOR,
                },
              ]
            : []),
        ],
      };
    });
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      const seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  function save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  const CustomerDB = {
    STATUS,
    PACKAGES,

    getAll() {
      return load();
    },

    getById(id) {
      return load().find((c) => c.id === id) || null;
    },

    isPppoeTaken(pppoe, excludeId) {
      return load().some(
        (c) => c.pppoe_secret === pppoe && c.id !== excludeId
      );
    },

    summary() {
      const list = load();
      return {
        total: list.length,
        active: list.filter((c) => c.customer_status === STATUS.ACTIVE).length,
        isolir: list.filter((c) => c.customer_status === STATUS.ISOLIR).length,
        terminate: list.filter((c) => c.customer_status === STATUS.TERMINATE)
          .length,
      };
    },

    /** Registrasi pelanggan baru — Business Rule #1 & #3 */
    create(data) {
      const list = load();
      if (this.isPppoeTaken(data.pppoe_secret)) {
        throw new Error("PPPoE Secret sudah digunakan pelanggan lain.");
      }
      const id = uid("CUST");
      const record = {
        id,
        customer_name: data.customer_name,
        pppoe_secret: data.pppoe_secret,
        phone_number: data.phone_number,
        subscribe_date: data.subscribe_date,
        expired_date: data.expired_date,
        installation_address: data.installation_address,
        package_name: data.package_name,
        customer_status: STATUS.ACTIVE,
        modem_serial_number: data.modem_serial_number,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        olt_port: data.olt_port,
        onu_number: data.onu_number,
        access_name: data.access_name,
        access_port: data.access_port,
        package_history: [
          {
            package_name: data.package_name,
            changed_at: nowISO(),
            note: "Paket awal saat registrasi",
          },
        ],
        address_history: [
          {
            address: data.installation_address,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            changed_at: nowISO(),
            note: "Alamat pemasangan awal",
          },
        ],
        activity_log: [
          {
            timestamp: nowISO(),
            action: "Registrasi",
            detail: `Pelanggan ${data.customer_name} berhasil didaftarkan dengan paket ${data.package_name}.`,
            actor: ACTOR,
          },
        ],
      };
      list.push(record);
      save(list);
      return record;
    },

    /** Update data administrasi/teknis pelanggan — Business Rule #4, #5, #9 */
    update(id, data) {
      const list = load();
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Pelanggan tidak ditemukan.");
      const current = list[idx];

      if (
        data.pppoe_secret !== current.pppoe_secret &&
        this.isPppoeTaken(data.pppoe_secret, id)
      ) {
        throw new Error("PPPoE Secret sudah digunakan pelanggan lain.");
      }

      const logs = [];

      // Perubahan paket -> simpan histori, jangan hilangkan histori lama (Rule #4)
      if (data.package_name !== current.package_name) {
        current.package_history.push({
          package_name: data.package_name,
          changed_at: nowISO(),
          note: `Perubahan dari ${current.package_name} ke ${data.package_name}`,
        });
        logs.push({
          timestamp: nowISO(),
          action: "Perubahan Paket",
          detail: `Paket layanan diubah dari ${current.package_name} menjadi ${data.package_name}.`,
          actor: ACTOR,
        });
      }

      // Relokasi -> alamat & koordinat wajib diperbarui bersamaan (Rule #5)
      const addressChanged =
        data.installation_address !== current.installation_address ||
        parseFloat(data.latitude) !== current.latitude ||
        parseFloat(data.longitude) !== current.longitude;
      if (addressChanged) {
        current.address_history.push({
          address: data.installation_address,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          changed_at: nowISO(),
          note: "Relokasi alamat pemasangan",
        });
        logs.push({
          timestamp: nowISO(),
          action: "Relokasi",
          detail: `Alamat pemasangan diperbarui ke "${data.installation_address}" (lat ${data.latitude}, long ${data.longitude}).`,
          actor: ACTOR,
        });
      }

      const techFields = [
        "pppoe_secret",
        "modem_serial_number",
        "olt_port",
        "onu_number",
        "access_name",
        "access_port",
      ];
      const techChanged = techFields.some((f) => data[f] !== current[f]);
      if (techChanged) {
        logs.push({
          timestamp: nowISO(),
          action: "Update Informasi Teknis",
          detail:
            "Informasi teknis (PPPoE/SN Modem/Port OLT/ONU/Access) diperbarui.",
          actor: ACTOR,
        });
      }

      const adminFields = [
        "customer_name",
        "phone_number",
        "subscribe_date",
        "expired_date",
      ];
      const adminChanged = adminFields.some((f) => data[f] !== current[f]);
      if (adminChanged) {
        logs.push({
          timestamp: nowISO(),
          action: "Update Data Pelanggan",
          detail: "Data administrasi pelanggan diperbarui.",
          actor: ACTOR,
        });
      }

      Object.assign(current, {
        customer_name: data.customer_name,
        pppoe_secret: data.pppoe_secret,
        phone_number: data.phone_number,
        subscribe_date: data.subscribe_date,
        expired_date: data.expired_date,
        installation_address: data.installation_address,
        package_name: data.package_name,
        modem_serial_number: data.modem_serial_number,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        olt_port: data.olt_port,
        onu_number: data.onu_number,
        access_name: data.access_name,
        access_port: data.access_port,
      });

      if (logs.length === 0) {
        logs.push({
          timestamp: nowISO(),
          action: "Update Data Pelanggan",
          detail: "Data pelanggan disimpan (tidak ada perubahan nilai).",
          actor: ACTOR,
        });
      }
      current.activity_log.push(...logs);

      list[idx] = current;
      save(list);
      return current;
    },

    /** Suspend layanan — Rule #6, #7 */
    suspend(id, reason) {
      const list = load();
      const c = list.find((x) => x.id === id);
      if (!c) throw new Error("Pelanggan tidak ditemukan.");
      if (c.customer_status !== STATUS.ACTIVE) {
        throw new Error("Hanya pelanggan Active yang dapat di-suspend.");
      }
      c.customer_status = STATUS.ISOLIR;
      c.activity_log.push({
        timestamp: nowISO(),
        action: "Suspend",
        detail: reason
          ? `Layanan disuspend (Isolir). Alasan: ${reason}`
          : "Layanan disuspend (Isolir).",
        actor: ACTOR,
      });
      save(list);
      return c;
    },

    /** Aktivasi kembali dari Isolir -> Active — Rule #6, #7 */
    reactivate(id) {
      const list = load();
      const c = list.find((x) => x.id === id);
      if (!c) throw new Error("Pelanggan tidak ditemukan.");
      if (c.customer_status !== STATUS.ISOLIR) {
        throw new Error("Hanya pelanggan Isolir yang dapat diaktifkan kembali.");
      }
      c.customer_status = STATUS.ACTIVE;
      c.activity_log.push({
        timestamp: nowISO(),
        action: "Aktivasi Kembali",
        detail: "Status pelanggan dikembalikan menjadi Active.",
        actor: ACTOR,
      });
      save(list);
      return c;
    },

    /** Terminasi permanen — Rule #6, #8 (data tetap tersimpan sebagai arsip) */
    terminate(id, reason) {
      const list = load();
      const c = list.find((x) => x.id === id);
      if (!c) throw new Error("Pelanggan tidak ditemukan.");
      if (c.customer_status === STATUS.TERMINATE) {
        throw new Error("Pelanggan sudah dalam status Terminate.");
      }
      c.customer_status = STATUS.TERMINATE;
      c.activity_log.push({
        timestamp: nowISO(),
        action: "Terminate",
        detail: reason
          ? `Layanan dihentikan permanen. Alasan: ${reason}`
          : "Layanan dihentikan permanen.",
        actor: ACTOR,
      });
      save(list);
      return c;
    },

    resetSeed() {
      const seeded = seedData();
      save(seeded);
      return seeded;
    },
  };

  global.CustomerDB = CustomerDB;
})(window);
