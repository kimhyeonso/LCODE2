import { Link } from "react-router-dom";
import { useState } from "react";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
  } = useShop();

  const [selected, setSelected] = useState([]);

  const all =
    cart.length > 0 &&
    selected.length === cart.length;

  const chosen = cart.filter((item) =>
    selected.includes(item.id)
  );

  const subtotal = chosen.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const shipping =
    chosen.length > 0 ? 3000 : 0;

  return (
    <main className={styles.cartPage}>
      <div className={styles.cartRail}>
        <span className={styles.pageEyebrow}>
          SHOP / CART
        </span>

        <h1>CART</h1>

        <div className={styles.cartTools}>
          <label>
            <input
              type="checkbox"
              checked={all}
              onChange={() =>
                setSelected(
                  all
                    ? []
                    : cart.map(
                        (item) => item.id
                      )
                )
              }
            />
            전체 선택
          </label>

          <button
            onClick={() =>
              cart.forEach((item) =>
                removeFromCart(item.id)
              )
            }
          >
            전체 삭제
          </button>
        </div>

        {cart.map((item) => (
          <div
            className={styles.cartItem}
            key={item.id}
          >
            <input
              type="checkbox"
              checked={selected.includes(
                item.id
              )}
              onChange={() =>
                setSelected(
                  selected.includes(item.id)
                    ? selected.filter(
                        (id) =>
                          id !== item.id
                      )
                    : [
                        ...selected,
                        item.id,
                      ]
                )
              }
            />

            <div
              className={styles.cartVisual}
            />

            <div>
              <small>
                {item.category}
              </small>

              <h3>{item.name}</h3>

              <p>
                기본 / Standard
              </p>

              <div
                className={
                  styles.quantity
                }
              >
                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.quantity - 1
                    )
                  }
                >
                  -
                </button>

                <b>
                  {item.quantity}
                </b>

                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.quantity + 1
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>

            <strong>
              {(
                item.price *
                item.quantity
              ).toLocaleString()}{" "}
              KRW
            </strong>

            <button
              className={styles.remove}
              onClick={() =>
                removeFromCart(item.id)
              }
            >
              ×
            </button>
          </div>
        ))}

        {!cart.length && (
          <div className={styles.empty}>
            <p>
              장바구니가 비어 있습니다.
            </p>

            <Link to="/shop">
              쇼핑 계속하기 →
            </Link>
          </div>
        )}

        <div className={styles.cartSummary}>
          <div className={styles.totalBox}>
            <p>
              SUBTOTAL
              <b>
                {subtotal.toLocaleString()} KRW
              </b>
            </p>

            <p>
              SHIPPING
              <b>
                {shipping.toLocaleString()} KRW
              </b>
            </p>

            <hr />

            <h2>
              TOTAL
              <strong>
                {(
                  subtotal + shipping
                ).toLocaleString()}{" "}
                <em>KRW</em>
              </strong>
            </h2>
          </div>

          {cart.length > 0 && (
            <Link
              className={styles.primaryButton}
              to="/checkout"
            >
              선택 상품 구매하기 (
              {chosen.length})
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}