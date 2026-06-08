import { useNavigate } from 'react-router-dom';

import Container, { ContainerRow } from "components/containers/Container";
import DeclarationRenderer from "components/DeclarationRenderer";
import Span from "components/Span";

import { useAuth } from 'context/authContext';

import { useFetch } from "hooks/useFetch";

import PATH from 'config/paths';

const Address = ({ path }) => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const getData = useFetch({
        path: "/me/address",
        method: "GET",
        credentials: "include",
        immediate: true,
    });

    const deleteData = useFetch({
        method: "DELETE",
        credentials: "include",
        immediate: false,
    });

    const setPrimary = useFetch({
        method: "POST",
        credentials: "include",
        immediate: false,
    });
    
    const AddressesRenderer = ({ addresses, loading, error }) => (
        <DeclarationRenderer
            items={addresses}
            loading={loading}
            error={error}
            renderHeader={(address) => (
                <Span className="text-uppercase ibm-plex-mono-regular">
                    {address.id === user.primaryaddressid ? "[PRINCIPAL] - " : ""}
                    {address?.address}
                </Span>
            )}
            renderDetails={(address) => (
                <ContainerRow>
                    <Span className="small text-uppercase">
                        {[address?.commune, address?.region].join(', ')}
                    </Span>
                </ContainerRow>
            )}
            actions={({ loading }) => (
                <button
                    className="btn btn-primary px-3 py-2"
                    onClick={() =>
                        !loading &&
                        navigate(`${PATH.declarations.declaration.build({ declarationType: "direccion" })}?redirectTo=${path}`)
                    }
                >
                    <ContainerRow className={loading ? "placeholder-wave" : ""}>
                        <Span className={loading ? "bg-body rounded-pill placeholder col-12" : ""}>
                            {loading ? "cargando" : "Declarar dirección"}
                        </Span>
                    </ContainerRow>
                </button>
            )}
            options={[
                
                { label: "Marcar como principal", onClick: async ({ item } = {}) => {
                    const res = await setPrimary.run({
                        path: `/me/address/${item.id}`,
                    });
                    if (res?.ok) {
                        await getData.run();
                        await refreshUser();
                    }
                } },
                { label: "Eliminar", onClick: async ({ item } = {}) => {
                    const res = await deleteData.run({
                        path: `/me/address/${item.id}`,
                    });
                    if (res?.ok) {
                        await getData.run();
                        await refreshUser();
                    }
                } },
            ]}
        />
    );

    return (
        <Container>
            <AddressesRenderer addresses={getData.data} loading={getData.loading} error={getData.error} />
        </Container>
    );
};

export default Address;