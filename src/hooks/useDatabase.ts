import { useState, useEffect } from 'react';
import { 
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Santri, Absensi, Pelanggaran, Info } from '../types';

export function useDatabase() {
  const [dataSantri, setDataSantri] = useState<Santri[]>([]);
  const [dataAbsensi, setDataAbsensi] = useState<Absensi[]>([]);
  const [dataPelanggaran, setDataPelanggaran] = useState<Pelanggaran[]>([]);
  const [dataInfo, setDataInfo] = useState<Info[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSantri = onSnapshot(collection(db, 'santri'), (snapshot) => {
      setDataSantri(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Santri)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'santri'));

    const unsubAbsensi = onSnapshot(collection(db, 'absensi'), (snapshot) => {
      setDataAbsensi(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Absensi)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'absensi'));

    const unsubPelanggaran = onSnapshot(collection(db, 'pelanggaran'), (snapshot) => {
      setDataPelanggaran(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Pelanggaran)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pelanggaran'));

    const unsubInfo = onSnapshot(collection(db, 'info'), (snapshot) => {
      setDataInfo(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Info)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'info'));

    return () => {
      unsubSantri();
      unsubAbsensi();
      unsubPelanggaran();
      unsubInfo();
    };
  }, []);

  const addSantri = async (data: Omit<Santri, 'id'>) => {
    try {
      await addDoc(collection(db, 'santri'), data);
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'santri'); }
  };

  const updateSantri = async (id: string, data: Partial<Santri>) => {
    try {
      await updateDoc(doc(db, 'santri', id), data);
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `santri/${id}`); }
  };

  const deleteSantri = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'santri', id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `santri/${id}`); }
  };

  const addAbsensi = async (data: Omit<Absensi, 'id'>) => {
    try {
      await addDoc(collection(db, 'absensi'), data);
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'absensi'); }
  };

  const deleteAbsensi = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'absensi', id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `absensi/${id}`); }
  };

  const addPelanggaran = async (data: Omit<Pelanggaran, 'id'>) => {
    try {
      await addDoc(collection(db, 'pelanggaran'), data);
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'pelanggaran'); }
  };

  const updatePelanggaran = async (id: string, data: Partial<Pelanggaran>) => {
    try {
      await updateDoc(doc(db, 'pelanggaran', id), data);
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `pelanggaran/${id}`); }
  };

  const deletePelanggaran = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pelanggaran', id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `pelanggaran/${id}`); }
  };

  const addInfo = async (data: Omit<Info, 'id'>) => {
    try {
      await addDoc(collection(db, 'info'), data);
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'info'); }
  };

  const deleteInfo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'info', id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `info/${id}`); }
  };

  return {
    dataSantri, addSantri, updateSantri, deleteSantri,
    dataAbsensi, addAbsensi, deleteAbsensi,
    dataPelanggaran, addPelanggaran, updatePelanggaran, deletePelanggaran,
    dataInfo, addInfo, deleteInfo,
    loading
  };
}
